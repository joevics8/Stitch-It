import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, Camera, ImagePlus, Ruler, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Stitch-It — Get Measured, Get Styled',
  description: 'Get your measurements from two photos, browse styles, or request a custom design — all in one place.',
};

const CATEGORIES = [
  { label: 'Female Styles', href: '/styles?gender=female', gradient: 'from-[#7A3B5E] to-[#3E1F33]' },
  { label: 'Male Styles', href: '/styles?gender=male', gradient: 'from-[#8A3A2C] to-[#3D1712]' },
  { label: 'Styles for Kids', href: '/styles?gender=kid', gradient: 'from-[#2E4B5E] to-[#152530]' },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative border-b border-border bg-dot-grid bg-hero-glow overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[hsl(var(--verified))] mb-4">
            Welcome to Stitch-It
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-[1.1] text-[hsl(var(--ink))]">
            Get measured. Choose a style.{' '}
            <span className="italic text-[hsl(var(--verified))]">Get sewn.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto">
            No tape measure needed — two photos and your height are all it takes.
          </p>
        </div>
        <div className="relative border-t border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--seal))]" strokeWidth={1.75} />
            Photos are used only to estimate your measurements
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-xl md:text-2xl font-semibold mb-5">Choose a style</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`relative h-56 rounded-sm overflow-hidden bg-gradient-to-br ${cat.gradient} flex items-end p-4 group`}
            >
              <span className="text-white font-serif text-lg font-semibold leading-tight relative z-10">
                {cat.label}
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-sm border border-border overflow-hidden flex flex-col sm:flex-row">
          <div className="flex-1 p-5">
            <p className="font-semibold mb-1">Request a Style</p>
            <p className="text-sm text-muted-foreground">
              Have a specific style in mind? Upload a reference photo and we&rsquo;ll quote it for
              you.
            </p>
          </div>
          <Link
            href="/request-style"
            className="flex items-center justify-center gap-2 bg-[hsl(var(--verified))]/10 text-[hsl(var(--verified))] font-semibold px-6 py-4 sm:py-0 shrink-0 hover:bg-[hsl(var(--verified))]/15 transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="sm:hidden">Upload Your Style</span>
          </Link>
        </div>

        <Link
          href="/measurements"
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-sm bg-[hsl(var(--ink))] text-[hsl(var(--paper))] font-semibold py-3.5 hover:opacity-90 transition-opacity"
        >
          Create New Measurements <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 border-t border-border">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-center mb-8">
          How measuring works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Ruler, title: 'Enter your height', desc: 'Used to scale every other measurement accurately.' },
            { icon: Camera, title: 'Take two photos', desc: 'Front-facing and side-facing, fitted clothing.' },
            { icon: Sparkles, title: 'Get your measurements', desc: 'Chest, waist, hip, sleeve, inseam and more.' },
          ].map((step, i) => (
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
      </section>
    </div>
  );
}
