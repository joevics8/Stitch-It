'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Loader2, RotateCcw, Ruler, CheckCircle2, AlertCircle, AlertTriangle, ScanSearch, Upload, Save, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { detectPoseLandmarks, prepareImage, assessCaptureQuality, type NamedLandmark } from '@/lib/pose';
import { createClient } from '@/lib/supabase/client';

type Step = 'height' | 'front' | 'side' | 'analyzing' | 'review' | 'result';

interface CapturedShot {
  dataUrl: string;
  landmarks: NamedLandmark[];
  hasCriticalIssue: boolean;
}

interface MeasurementResult {
  unit: 'cm' | 'in';
  measurements: Record<string, number>;
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
  warnings?: string[];
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MeasureFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('height');
  const [heightCm, setHeightCm] = useState('');
  const [rawFrontDataUrl, setRawFrontDataUrl] = useState<string | null>(null);
  const [rawSideDataUrl, setRawSideDataUrl] = useState<string | null>(null);
  const [front, setFront] = useState<CapturedShot | null>(null);
  const [side, setSide] = useState<CapturedShot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [editedMeasurements, setEditedMeasurements] = useState<Record<string, string>>({});
  const [reviewedWarnings, setReviewedWarnings] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<'front' | 'side' | null>(null);

  const openCameraFor = (slot: 'front' | 'side') => {
    pendingSlot.current = slot;
    cameraInputRef.current?.click();
  };

  const openUploadFor = (slot: 'front' | 'side') => {
    pendingSlot.current = slot;
    uploadInputRef.current?.click();
  };

  // Capture only — no analysis here, so there's no wait between the two shots.
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slot = pendingSlot.current;
    e.target.value = ''; // allow re-selecting the same file later
    if (!file || !slot) return;

    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      if (slot === 'front') {
        setRawFrontDataUrl(dataUrl);
        setStep('side');
      } else {
        setRawSideDataUrl(dataUrl);
        setStep('analyzing');
      }
    } catch {
      setError('Something went wrong reading that photo. Please try again.');
    }
  }, []);

  // Runs once both photos are in hand. Each photo is downscaled and
  // decoded through a canvas (which also normalizes EXIF orientation)
  // before MediaPipe runs on it.
  const analyzeBoth = useCallback(async () => {
    if (!rawFrontDataUrl || !rawSideDataUrl) return;
    setBusy(true);
    setError(null);
    try {
      const [frontPrepared, sidePrepared] = await Promise.all([
        prepareImage(rawFrontDataUrl),
        prepareImage(rawSideDataUrl),
      ]);
      const [frontLandmarks, sideLandmarks] = await Promise.all([
        detectPoseLandmarks(frontPrepared.canvas),
        detectPoseLandmarks(sidePrepared.canvas),
      ]);

      if (frontLandmarks.length === 0 && sideLandmarks.length === 0) {
        setError("Couldn't detect a person in either photo. Make sure your full body is visible and well-lit.");
        setStep('front');
        return;
      }
      if (frontLandmarks.length === 0) {
        setError("Couldn't detect a person in the front photo. Please retake it.");
        setRawFrontDataUrl(null);
        setStep('front');
        return;
      }
      if (sideLandmarks.length === 0) {
        setError("Couldn't detect a person in the side photo. Please retake it.");
        setRawSideDataUrl(null);
        setStep('side');
        return;
      }

      setFront({
        dataUrl: frontPrepared.dataUrl,
        landmarks: frontLandmarks,
        hasCriticalIssue: assessCaptureQuality(frontLandmarks).hasCriticalIssue,
      });
      setSide({
        dataUrl: sidePrepared.dataUrl,
        landmarks: sideLandmarks,
        hasCriticalIssue: assessCaptureQuality(sideLandmarks).hasCriticalIssue,
      });
      setStep('review');
    } catch {
      setError('Something went wrong analyzing your photos. Please try again.');
      setStep('review');
    } finally {
      setBusy(false);
    }
  }, [rawFrontDataUrl, rawSideDataUrl]);

  // Kick off analysis as soon as we enter the 'analyzing' step.
  useEffect(() => {
    if (step === 'analyzing' && rawFrontDataUrl && rawSideDataUrl && !front && !side) {
      analyzeBoth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rawFrontDataUrl, rawSideDataUrl]);

  const submitForMeasurement = async () => {
    if (!front || !side || !heightCm) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/measure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightCm: Number(heightCm),
          front: { image: front.dataUrl, landmarks: front.landmarks },
          side: { image: side.dataUrl, landmarks: side.landmarks },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Measurement request failed.');
      }

      const data: MeasurementResult = await res.json();
      setResult(data);
      const initialEdits: Record<string, string> = {};
      for (const [key, value] of Object.entries(data.measurements)) {
        initialEdits[key] = String(value);
      }
      setEditedMeasurements(initialEdits);
      setReviewedWarnings(false);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const hasWarnings = (result?.warnings?.length ?? 0) > 0;
  const canSave = profileName.trim() && (!hasWarnings || reviewedWarnings);

  const saveProfile = async () => {
    if (!result || !canSave) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/measure');
        return;
      }

      // Final values reflect any edits the user made; ai_raw_measurements
      // keeps exactly what the model said, untouched — the only way to
      // ever tell later whether the AI's estimate was actually right.
      const m = Object.fromEntries(
        Object.entries(editedMeasurements).map(([k, v]) => [k, Number(v)])
      );

      const { data: inserted, error: insertError } = await supabase
        .from('measurement_profiles')
        .insert({
          user_id: user.id,
          name: profileName.trim(),
          source: 'photo',
          unit: result.unit,
          body_height: heightCm ? Number(heightCm) : null,
          shoulder_width: m.shoulder_width ?? null,
          chest_bust: m.chest ?? null,
          waist: m.waist ?? null,
          hip: m.hip ?? null,
          arm_length: m.sleeve_length ?? null,
          inseam: m.inseam ?? null,
          neck: m.neck ?? null,
          ai_confidence: result.confidence,
          ai_notes: result.notes ?? null,
          ai_raw_measurements: result.measurements,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      setSavedProfileId(inserted?.id ?? null);
      setSaved(true);
    } catch {
      setError('Could not save this measurement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startOver = () => {
    setStep('height');
    setHeightCm('');
    setRawFrontDataUrl(null);
    setRawSideDataUrl(null);
    setFront(null);
    setSide(null);
    setResult(null);
    setEditedMeasurements({});
    setReviewedWarnings(false);
    setError(null);
    setProfileName('');
    setSaved(false);
    setSavedProfileId(null);
  };

  const retakeBoth = () => {
    setRawFrontDataUrl(null);
    setRawSideDataUrl(null);
    setFront(null);
    setSide(null);
    setError(null);
    setStep('front');
  };

  const captureIssue = front?.hasCriticalIssue || side?.hasCriticalIssue;

  return (
    <div className="max-w-md mx-auto px-4 py-10 pb-28">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs uppercase tracking-[0.14em] font-mono text-[hsl(var(--verified))] mb-2">
        Stitch-It
      </p>
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-1">Get your measurements</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Two photos and your height — we&rsquo;ll estimate the rest.
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'height' && (
        <Card className="p-5">
          <Label htmlFor="height" className="text-sm font-semibold">
            Your height (cm)
          </Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            This is how we scale pixel distances into real measurements.
          </p>
          <Input
            id="height"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 172"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            min={100}
            max={230}
          />
          <Button
            className="w-full mt-4"
            disabled={!heightCm || Number(heightCm) < 100 || Number(heightCm) > 230}
            onClick={() => setStep('front')}
          >
            Continue
          </Button>
        </Card>
      )}

      {(step === 'front' || step === 'side') && (
        <Card className="p-5 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center">
            <Camera className="h-6 w-6 text-[hsl(var(--verified))]" />
          </div>
          <h2 className="font-semibold mb-1">
            {step === 'front' ? 'Front-facing photo' : 'Side-facing photo'}
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            {step === 'front' ? 'Photo 1 of 2' : 'Photo 2 of 2'}
          </p>
          <ul className="text-xs text-muted-foreground text-left mt-1 mb-5 space-y-1.5 list-disc list-inside">
            <li>Prop your phone up (a shelf, tripod, or a friend) — don&rsquo;t hold it yourself</li>
            <li>Stand 2–3m back, phone at chest height and level</li>
            <li>Wear fitted clothing — no baggy layers</li>
            <li>Stand against a plain background, full body in frame</li>
            <li>Feet together, arms slightly away from your sides</li>
            <li>{step === 'front' ? 'Face the camera directly' : 'Turn 90° so your side profile faces the camera'}</li>
          </ul>
          <Button className="w-full" onClick={() => openCameraFor(step)}>
            <Camera className="h-4 w-4 mr-2" />
            Take photo
          </Button>
          <Button variant="outline" className="w-full mt-2" onClick={() => openUploadFor(step)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload from gallery
          </Button>
        </Card>
      )}

      {step === 'analyzing' && (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center">
            <ScanSearch className="h-6 w-6 text-[hsl(var(--verified))] animate-pulse" />
          </div>
          <h2 className="font-semibold mb-1">Analyzing your photos&hellip;</h2>
          <p className="text-xs text-muted-foreground">Detecting body landmarks in both shots.</p>
          <Loader2 className="h-4 w-4 animate-spin mx-auto mt-4 text-muted-foreground" />
        </Card>
      )}

      {step === 'review' && front && side && (
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Review your photos</h2>

          {captureIssue && (
            <div className="mb-4 flex items-start gap-2 rounded-sm border border-[hsl(var(--seal))] bg-[hsl(var(--seal))]/10 p-3 text-sm text-[hsl(var(--ink))]">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-[hsl(var(--seal))]" />
              <span>
                Some key points (like a shoulder or hip) weren&rsquo;t clearly visible in{' '}
                {front.hasCriticalIssue && side.hasCriticalIssue ? 'either photo' : front.hasCriticalIssue ? 'the front photo' : 'the side photo'}.
                You can continue, but a retake with arms further from your body may be more accurate.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={front.dataUrl} alt="Front pose" className="rounded-sm border border-border w-full aspect-[3/4] object-cover" />
              <p className="text-xs text-center mt-1 text-muted-foreground">Front</p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={side.dataUrl} alt="Side pose" className="rounded-sm border border-border w-full aspect-[3/4] object-cover" />
              <p className="text-xs text-center mt-1 text-muted-foreground">Side</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={retakeBoth} disabled={busy}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retake
            </Button>
            <Button className="flex-1" onClick={submitForMeasurement} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ruler className="h-4 w-4 mr-2" />}
              {busy ? 'Measuring…' : 'Get measurements'}
            </Button>
          </div>
        </Card>
      )}

      {step === 'result' && result && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--verified))]" />
            <h2 className="font-semibold">Your estimated measurements</h2>
          </div>

          {hasWarnings && (
            <div className="mb-4 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">A few numbers look off — please double-check them:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {result.warnings!.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-2">Tap any value to correct it.</p>
          <div className="divide-y divide-border">
            {Object.entries(editedMeasurements).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 text-sm gap-3">
                <span className="capitalize text-muted-foreground">{label.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) =>
                      setEditedMeasurements((prev) => ({ ...prev, [label]: e.target.value }))
                    }
                    className="w-20 h-8 text-right font-mono text-sm px-2"
                  />
                  <span className="text-xs text-muted-foreground">{result.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 hover:text-foreground"
            onClick={() => {
              const reset: Record<string, string> = {};
              for (const [key, value] of Object.entries(result.measurements)) reset[key] = String(value);
              setEditedMeasurements(reset);
            }}
          >
            <RefreshCcw className="h-3 w-3" /> Reset to AI estimate
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Confidence: <span className="capitalize font-medium">{result.confidence}</span>
            {result.notes ? ` — ${result.notes}` : ''}
          </p>

          {saved ? (
            <div className="mt-5 rounded-sm border border-[hsl(var(--verified))] bg-[hsl(var(--verified))]/5 p-3 text-sm text-[hsl(var(--verified))] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Saved as &ldquo;{profileName}&rdquo;
            </div>
          ) : (
            <div className="mt-5">
              {hasWarnings && (
                <label className="flex items-start gap-2 text-xs mb-3">
                  <input
                    type="checkbox"
                    checked={reviewedWarnings}
                    onChange={(e) => setReviewedWarnings(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>I&rsquo;ve reviewed the flagged numbers above and corrected or confirmed them.</span>
                </label>
              )}
              <Label htmlFor="profileName" className="text-sm font-semibold">
                Save this as
              </Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Suit, Agbada, My Measurements"
                className="mt-1.5"
              />
              <Button className="w-full mt-3" disabled={!canSave || saving} onClick={saveProfile}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? 'Saving…' : 'Save Measurements'}
              </Button>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {saved && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(savedProfileId ? `/select-style?measurementId=${savedProfileId}` : '/measurements')}
              >
                Select a Style
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={startOver}>
              <RotateCcw className="h-4 w-4 mr-2" /> Measure again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
