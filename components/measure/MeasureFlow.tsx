'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Loader2, RotateCcw, Ruler, CheckCircle2, AlertCircle, ScanSearch, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { detectPoseLandmarks, loadImage, type NamedLandmark } from '@/lib/pose';

type Step = 'height' | 'front' | 'side' | 'analyzing' | 'review' | 'result';

interface CapturedShot {
  dataUrl: string;
  landmarks: NamedLandmark[];
}

interface MeasurementResult {
  unit: 'cm' | 'in';
  measurements: Record<string, number>;
  confidence: 'low' | 'medium' | 'high';
  notes?: string;
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
  const [step, setStep] = useState<Step>('height');
  const [heightCm, setHeightCm] = useState('');
  const [frontDataUrl, setFrontDataUrl] = useState<string | null>(null);
  const [sideDataUrl, setSideDataUrl] = useState<string | null>(null);
  const [front, setFront] = useState<CapturedShot | null>(null);
  const [side, setSide] = useState<CapturedShot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeasurementResult | null>(null);

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
        setFrontDataUrl(dataUrl);
        setStep('side');
      } else {
        setSideDataUrl(dataUrl);
        setStep('analyzing');
      }
    } catch {
      setError('Something went wrong reading that photo. Please try again.');
    }
  }, []);

  // Runs once both photos are in hand — analyzes each with MediaPipe.
  const analyzeBoth = useCallback(async () => {
    if (!frontDataUrl || !sideDataUrl) return;
    setBusy(true);
    setError(null);
    try {
      const [frontImg, sideImg] = await Promise.all([loadImage(frontDataUrl), loadImage(sideDataUrl)]);
      const [frontLandmarks, sideLandmarks] = await Promise.all([
        detectPoseLandmarks(frontImg),
        detectPoseLandmarks(sideImg),
      ]);

      if (frontLandmarks.length === 0 && sideLandmarks.length === 0) {
        setError("Couldn't detect a person in either photo. Make sure your full body is visible and well-lit.");
        setStep('front');
        return;
      }
      if (frontLandmarks.length === 0) {
        setError("Couldn't detect a person in the front photo. Please retake it.");
        setFrontDataUrl(null);
        setStep('front');
        return;
      }
      if (sideLandmarks.length === 0) {
        setError("Couldn't detect a person in the side photo. Please retake it.");
        setSideDataUrl(null);
        setStep('side');
        return;
      }

      setFront({ dataUrl: frontDataUrl, landmarks: frontLandmarks });
      setSide({ dataUrl: sideDataUrl, landmarks: sideLandmarks });
      setStep('review');
    } catch {
      setError('Something went wrong analyzing your photos. Please try again.');
      setStep('review');
    } finally {
      setBusy(false);
    }
  }, [frontDataUrl, sideDataUrl]);

  // Kick off analysis as soon as we enter the 'analyzing' step.
  useEffect(() => {
    if (step === 'analyzing' && frontDataUrl && sideDataUrl && !front && !side) {
      analyzeBoth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, frontDataUrl, sideDataUrl]);

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
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    setStep('height');
    setHeightCm('');
    setFrontDataUrl(null);
    setSideDataUrl(null);
    setFront(null);
    setSide(null);
    setResult(null);
    setError(null);
  };

  const retakeBoth = () => {
    setFrontDataUrl(null);
    setSideDataUrl(null);
    setFront(null);
    setSide(null);
    setError(null);
    setStep('front');
  };

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
            <li>Wear fitted clothing — no baggy layers</li>
            <li>Stand against a plain background</li>
            <li>Full body in frame, arms slightly away from your sides</li>
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
          <div className="divide-y divide-border">
            {Object.entries(result.measurements).map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 text-sm">
                <span className="capitalize text-muted-foreground">{label.replace(/_/g, ' ')}</span>
                <span className="font-mono font-semibold">
                  {value} {result.unit}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Confidence: <span className="capitalize font-medium">{result.confidence}</span>
            {result.notes ? ` — ${result.notes}` : ''}
          </p>
          <Button variant="outline" className="w-full mt-5" onClick={startOver}>
            <RotateCcw className="h-4 w-4 mr-2" /> Measure again
          </Button>
        </Card>
      )}
    </div>
  );
}
