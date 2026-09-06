export interface MeasurementProfile {
  id: string;
  user_id: string;
  name: string;
  source: 'manual' | 'photo';
  unit: 'cm' | 'in';
  body_height: number | null;
  head_circumference: number | null;
  neck: number | null;
  shoulder_width: number | null;
  chest_bust: number | null;
  arm_hole: number | null;
  arm_length: number | null;
  waist: number | null;
  hip: number | null;
  wrist_circumference: number | null;
  inseam: number | null;
  trouser_length: number | null;
  rise: number | null;
  thigh: number | null;
  ai_confidence: 'low' | 'medium' | 'high' | null;
  ai_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const MEASUREMENT_FIELDS: { key: keyof MeasurementProfile; label: string }[] = [
  { key: 'body_height', label: 'Body Height' },
  { key: 'head_circumference', label: 'Head Circumference' },
  { key: 'neck', label: 'Neck' },
  { key: 'shoulder_width', label: 'Shoulder Width' },
  { key: 'chest_bust', label: 'Chest / Bust' },
  { key: 'arm_hole', label: 'Arm Hole' },
  { key: 'arm_length', label: 'Arm Length' },
  { key: 'waist', label: 'Waist Size' },
  { key: 'hip', label: 'Hip Measurement' },
  { key: 'wrist_circumference', label: 'Wrist Circumference' },
  { key: 'inseam', label: 'Lap Length / Inseam' },
  { key: 'trouser_length', label: 'Trouser Length / Outseam' },
  { key: 'rise', label: 'Rise' },
  { key: 'thigh', label: 'Thigh' },
];
