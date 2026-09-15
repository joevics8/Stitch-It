import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'fs/promises';
import path from 'path';
import { validateMeasurements } from '@/lib/measurement-validation';

export const runtime = 'nodejs';

interface LandmarkPoint {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseInput {
  image: string; // data URL
  landmarks: LandmarkPoint[];
}

interface MeasureRequestBody {
  heightCm: number;
  front: PoseInput;
  side: PoseInput;
}

function dataUrlToInlineData(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data URL');
  return { mimeType: match[1], data: match[2] };
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    unit: { type: 'string', enum: ['cm'] },
    measurements: {
      type: 'object',
      properties: {
        shoulder_width: { type: 'number' },
        chest: { type: 'number' },
        waist: { type: 'number' },
        hip: { type: 'number' },
        sleeve_length: { type: 'number' },
        inseam: { type: 'number' },
        neck: { type: 'number' },
      },
      required: ['shoulder_width', 'chest', 'waist', 'hip', 'sleeve_length', 'inseam', 'neck'],
    },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    notes: { type: 'string' },
  },
  required: ['unit', 'measurements', 'confidence'],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server is missing GEMINI_API_KEY.' }, { status: 500 });
  }

  let body: MeasureRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { heightCm, front, side } = body ?? {};
  if (!heightCm || !front?.image || !side?.image) {
    return NextResponse.json({ error: 'heightCm, front, and side are all required.' }, { status: 400 });
  }

  try {
    const guidePath = path.join(process.cwd(), 'public', 'measurement-guide.png');
    const guideBuffer = await readFile(guidePath);

    const ai = new GoogleGenAI({ apiKey });
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3-flash-preview';

    const frontImage = dataUrlToInlineData(front.image);
    const sideImage = dataUrlToInlineData(side.image);

    const prompt = `You are an expert tailor's assistant estimating body measurements for garment fitting.

You are given:
1. A reference diagram (image 1) showing the standard body measurement points and how each is defined.
2. A front-facing photo of a person (image 2), plus MediaPipe pose landmarks detected on it (normalized 0-1 coordinates, origin top-left). Each landmark includes a "visibility" score (0-1) — MediaPipe's own confidence that the point was actually visible rather than occluded or guessed: ${JSON.stringify(front.landmarks)}
3. A side-facing photo of the same person (image 3), plus its MediaPipe pose landmarks with the same visibility scores: ${JSON.stringify(side.landmarks)}
4. The person's actual height: ${heightCm} cm — use this as your real-world scale reference.

Using the height as scale and the landmark coordinates plus what you observe visually in both photos, estimate these measurements in centimeters: shoulder width, chest/bust, waist, hip, sleeve length, inseam, and neck circumference.

Girth measurements (chest, waist, hip, neck) must be inferred from the combination of front width and side depth (treat the torso cross-section as roughly elliptical) — do not just double the front-view width.

Any landmark with visibility below 0.5 was likely occluded or estimated by MediaPipe rather than clearly seen — rely more on your own visual reading of the photo for measurements that depend on that point, and lower your confidence accordingly.

Respond ONLY with JSON matching the provided schema. Set "confidence" based on image quality, pose clarity, landmark visibility scores, and whether clothing was baggy. Use "notes" for anything that reduced your confidence (e.g. "arms partially occluded shoulder points").`;

    const contents = [
      {
        role: 'user' as const,
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: guideBuffer.toString('base64') } },
          { inlineData: frontImage },
          { inlineData: sideImage },
        ],
      },
    ];

    const generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    };

    let response;
    try {
      response = await ai.models.generateContent({ model: primaryModel, contents, config: generationConfig });
    } catch (primaryErr) {
      console.warn(`Gemini primary model "${primaryModel}" failed, falling back to "${fallbackModel}"`, primaryErr);
      response = await ai.models.generateContent({ model: fallbackModel, contents, config: generationConfig });
    }

    const text = response.text;
    if (!text) {
      return NextResponse.json({ error: 'No response from Gemini.' }, { status: 502 });
    }

    const parsed = JSON.parse(text);

    // Independent sanity check — never trust the model's self-reported
    // confidence alone. If the numbers themselves are implausible, flag it
    // regardless of what Gemini says about itself.
    const validation = validateMeasurements(parsed.measurements ?? {}, heightCm);
    if (!validation.ok) {
      parsed.confidence = 'low';
      parsed.warnings = validation.warnings;
      const warningNote = `Automatic check flagged: ${validation.warnings.join('; ')}.`;
      parsed.notes = parsed.notes ? `${warningNote} ${parsed.notes}` : warningNote;
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('measure route error', err);
    return NextResponse.json({ error: 'Failed to estimate measurements. Please try again.' }, { status: 500 });
  }
}
