import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Stitch-It handles your photos and data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[hsl(var(--verified))] mb-2">Legal</p>
      <h1 className="font-serif text-3xl font-semibold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Placeholder — replace with a policy reviewed for your jurisdiction before launch.</p>
        <p>
          In outline: photos you take are processed to detect body pose and estimate measurements.
          Photos and the resulting measurements are sent to our AI provider solely to compute your
          results and are not used to train models or shared with third parties for marketing.
        </p>
      </div>
    </div>
  );
}
