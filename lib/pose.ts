'use client';

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

function getLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
      );
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
      });
    })();
  }
  return landmarkerPromise;
}

export interface NamedLandmark {
  name: string;
  x: number;
  y: number;
  z: number;
  /** 0-1 likelihood this point was actually visible (not occluded/guessed). */
  visibility: number;
}

// Subset of MediaPipe's 33 pose landmarks that actually matter for tailor
// measurements — index positions per the official pose landmark map.
const RELEVANT_LANDMARKS: Record<number, string> = {
  0: 'nose',
  11: 'left_shoulder',
  12: 'right_shoulder',
  13: 'left_elbow',
  14: 'right_elbow',
  15: 'left_wrist',
  16: 'right_wrist',
  23: 'left_hip',
  24: 'right_hip',
  25: 'left_knee',
  26: 'right_knee',
  27: 'left_ankle',
  28: 'right_ankle',
};

// Key points that most affect measurement accuracy if occluded or guessed.
const CRITICAL_LANDMARKS = new Set([
  'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_wrist', 'right_wrist',
]);

const LOW_VISIBILITY_THRESHOLD = 0.5;

export interface CaptureQuality {
  lowConfidencePoints: string[];
  hasCriticalIssue: boolean;
}

/** Flags landmarks MediaPipe wasn't confident about, so the UI can warn early. */
export function assessCaptureQuality(landmarks: NamedLandmark[]): CaptureQuality {
  const lowConfidencePoints = landmarks
    .filter((l) => l.visibility < LOW_VISIBILITY_THRESHOLD)
    .map((l) => l.name);
  const hasCriticalIssue = lowConfidencePoints.some((name) => CRITICAL_LANDMARKS.has(name));
  return { lowConfidencePoints, hasCriticalIssue };
}

/**
 * Runs pose detection on prepared image source (canvas, from prepareImage)
 * and returns the named landmarks we care about, including MediaPipe's
 * visibility score for each point.
 */
export async function detectPoseLandmarks(
  source: HTMLImageElement | HTMLCanvasElement
): Promise<NamedLandmark[]> {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(source);
  const pose = result.landmarks?.[0];
  if (!pose) return [];

  return Object.entries(RELEVANT_LANDMARKS).map(([indexStr, name]) => {
    const point = pose[Number(indexStr)];
    return { name, x: point.x, y: point.y, z: point.z, visibility: point.visibility };
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const MAX_DIMENSION = 1280;

export interface PreparedImage {
  canvas: HTMLCanvasElement;
  dataUrl: string;
}

/**
 * Loads an image and draws it to a canvas, downscaled to a sane max
 * dimension. Drawing through <img> -> canvas forces the browser to decode
 * using its orientation-corrected bitmap, which sidesteps EXIF rotation
 * bugs that can otherwise scramble which point is "shoulder" vs "hip" —
 * on top of cutting payload size for both on-device detection and the
 * upload to Gemini.
 */
export async function prepareImage(src: string): Promise<PreparedImage> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare image for analysis.');
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, dataUrl: canvas.toDataURL('image/jpeg', 0.85) };
}
