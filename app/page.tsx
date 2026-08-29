import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Camera, Ruler, Sparkles, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Stitch-It — Get Your Measurements From Two Photos',
  description: 'Take a front and side photo, enter your height, and get your body measurements estimated for tailoring — no tape measure needed.',
};

const STEPS = [
  { icon: Ruler, title: 'Enter your height', desc: 'Used to scale every other measurement accurately.' },
  { icon: Camera, title: 'Take two photos', desc: 'One front-facing, one side-facing — fitted clothing, plain background.' },
  { icon: Sparkles, title: 'Get your measurements', desc: 'Chest, waist, hip, sleeve, inseam and more, estimated in seconds.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative border-b border-border bg-dot-grid bg-hero-glow overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[hsl(var(--verified))] mb-5">
            No tape measure needed
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.08] text-[hsl(var(--ink))]">
            Your measurements, from{' '}
            <span className="italic text-[hsl(var(--verified))]">two photos</span>.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Stitch-It estimates the measurements a tailor would take — chest, waist, hip, sleeve
            length and more — straight from your phone.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/measure"
              className="inline-flex items-center gap-2 rounded-sm bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get measured <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative border-t border-border">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--seal))]" strokeWidth={1.75} />
            Photos are used only to estimate your measurements
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-12">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-sm border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[hsl(var(--verified))]/10 flex items-center justify-center">
                <step.icon className="h-5 w-5 text-[hsl(var(--verified))]" />
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-1">Step {i + 1}</p>
              <p className="font-semibold mb-1.5">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/measure" className="text-sm font-semibold text-[hsl(var(--verified))]">
            Start now &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
