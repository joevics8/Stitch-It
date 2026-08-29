import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Stitch-It estimates body measurements from two photos using on-device pose detection and AI.',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[hsl(var(--verified))] mb-2">About</p>
      <h1 className="font-serif text-3xl font-semibold mb-6">Why Stitch-It exists</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          Getting measured for tailored clothing usually means a tape measure, a second pair of
          hands, or a trip to a tailor. Stitch-It estimates the measurements a tailor would take —
          chest, waist, hip, shoulder width, sleeve length, inseam, and neck — from two photos and
          your height.
        </p>
        <p>
          Pose detection runs on your device; your photos and height are sent to our measurement
          model only to compute your results. This is an early version, and estimates will keep
          improving as we refine the approach.
        </p>
      </div>
    </div>
  );
}
