import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ManualMeasurementForm } from '@/components/measurements/ManualMeasurementForm';

export const metadata: Metadata = {
  title: 'Enter Measurements Manually',
};

export default function ManualMeasurementsPage() {
  return (
    <Suspense fallback={null}>
      <ManualMeasurementForm />
    </Suspense>
  );
}
