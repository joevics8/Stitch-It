// Rough anthropometric ratios (fraction of height) used as sanity bounds.
// Deliberately generous — this exists to catch clearly broken AI outputs
// (a chest reading as 300cm, a negative inseam), not to police normal
// human variation.
const RATIO_BOUNDS: Record<string, [number, number]> = {
  shoulder_width: [0.16, 0.34],
  chest: [0.38, 0.78],
  waist: [0.32, 0.72],
  hip: [0.38, 0.78],
  sleeve_length: [0.24, 0.58],
  inseam: [0.33, 0.56],
  neck: [0.12, 0.24],
};

// Absolute bounds (cm) as a second net independent of height, in case
// height itself was entered wrong.
const ABSOLUTE_BOUNDS: Record<string, [number, number]> = {
  shoulder_width: [25, 65],
  chest: [60, 170],
  waist: [45, 160],
  hip: [55, 170],
  sleeve_length: [35, 95],
  inseam: [45, 110],
  neck: [25, 55],
};

export interface ValidationResult {
  ok: boolean;
  warnings: string[];
}

export function validateMeasurements(
  measurements: Record<string, number>,
  heightCm: number
): ValidationResult {
  const warnings: string[] = [];

  for (const [key, value] of Object.entries(measurements)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      warnings.push(`${key.replace(/_/g, ' ')} came back as an invalid value`);
      continue;
    }

    const absBounds = ABSOLUTE_BOUNDS[key];
    if (absBounds && (value < absBounds[0] || value > absBounds[1])) {
      warnings.push(
        `${key.replace(/_/g, ' ')} (${value}cm) is outside the typical human range`
      );
      continue;
    }

    const ratioBounds = RATIO_BOUNDS[key];
    if (ratioBounds && heightCm > 0) {
      const ratio = value / heightCm;
      if (ratio < ratioBounds[0] || ratio > ratioBounds[1]) {
        warnings.push(
          `${key.replace(/_/g, ' ')} (${value}cm) looks disproportionate for a ${heightCm}cm height`
        );
      }
    }
  }

  const { hip, waist, chest, inseam } = measurements;
  if (hip && waist && hip < waist * 0.75) {
    warnings.push('hip came back noticeably smaller than waist, which is unusual');
  }
  if (chest && waist && waist > chest * 1.15) {
    warnings.push('waist came back larger than chest by more than expected');
  }
  if (inseam && heightCm > 0 && inseam >= heightCm) {
    warnings.push('inseam came back longer than height, which isn\u2019t possible');
  }

  return { ok: warnings.length === 0, warnings };
}
