import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Stitch-It measurements.',
};

const FAQS = [
  {
    q: 'How accurate are the measurements?',
    a: "Estimates are typically within a couple of centimeters under good conditions — fitted clothing, plain background, good lighting. They're a strong starting point, not a replacement for a professional tailor's tape when precision really matters.",
  },
  {
    q: 'What should I wear for the photos?',
    a: 'Fitted clothing works best — leggings and a fitted top, or similar. Baggy clothing hides your actual body outline and reduces accuracy.',
  },
  {
    q: 'What happens to my photos?',
    a: 'Your photos are used only to estimate your measurements. Pose detection runs in your browser before anything is sent anywhere.',
  },
  {
    q: 'Why do you need my height?',
    a: 'Height is the reference scale we use to convert pixel distances in your photos into real-world centimeters.',
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[hsl(var(--verified))] mb-2">FAQ</p>
      <h1 className="font-serif text-3xl font-semibold mb-8">Frequently asked questions</h1>
      <div className="space-y-6">
        {FAQS.map((item) => (
          <div key={item.q} className="border-b border-border pb-6">
            <p className="font-semibold mb-1.5">{item.q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
