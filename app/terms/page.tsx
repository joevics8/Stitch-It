import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of Stitch-It.',
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[hsl(var(--verified))] mb-2">Legal</p>
      <h1 className="font-serif text-3xl font-semibold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Placeholder — replace with terms reviewed for your jurisdiction before launch.</p>
        <p>
          In outline: measurements are AI-generated estimates provided for convenience and may
          differ from measurements taken by a professional tailor. Use them at your own discretion
          for garment fitting decisions.
        </p>
      </div>
    </div>
  );
}
