import { Metadata } from 'next';
import { MeasureFlow } from '@/components/measure/MeasureFlow';

export const metadata: Metadata = {
  title: 'Get Your Measurements — Stitch-It',
  description: 'Take two photos and get your body measurements estimated for tailoring.',
};

export default function MeasurePage() {
  return <MeasureFlow />;
}
