'use client';

import { FilesetResolver, PoseLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

/**
 * Lazily creates (and caches) a single PoseLandmarker instance for the
 * lifetime of the page. Model files are fetched from Google's CDN on first
 * use and cached by the browser after that.
 */
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

export interface NamedLandmark extends NormalizedLandmark {
  name: string;
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

/**
 * Runs pose detection on an already-loaded HTMLImageElement and returns the
 * named landmarks we care about, normalized (0-1) to image width/height.
 */
export async function detectPoseLandmarks(image: HTMLImageElement): Promise<NamedLandmark[]> {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(image);
  const pose = result.landmarks?.[0];
  if (!pose) return [];

  return Object.entries(RELEVANT_LANDMARKS).map(([indexStr, name]) => {
    const point = pose[Number(indexStr)];
    return { ...point, name };
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
