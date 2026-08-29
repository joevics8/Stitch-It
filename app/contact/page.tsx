import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Stitch-It team.',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[hsl(var(--verified))] mb-2">Contact</p>
      <h1 className="font-serif text-3xl font-semibold mb-6">Get in touch</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Questions, feedback, or an inaccurate measurement to report — reach us at{' '}
        <a href="mailto:hello@stitch-it.app" className="text-[hsl(var(--verified))] font-medium">
          hello@stitch-it.app
        </a>
        .
      </p>
    </div>
  );
}
