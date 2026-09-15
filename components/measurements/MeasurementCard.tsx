'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2, Loader2, Scissors } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { MeasurementProfile } from '@/lib/measurements';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function MeasurementCard({ profile }: { profile: MeasurementProfile }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${profile.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('measurement_profiles').delete().eq('id', profile.id);
    if (error) {
      alert('Could not delete this measurement. Please try again.');
      setDeleting(false);
      return;
    }
    router.refresh();
  };

  const selectStyleHref = `/styles?measurementId=${profile.id}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(selectStyleHref)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(selectStyleHref);
      }}
      className="flex items-center justify-between rounded-sm border border-border bg-card px-5 py-5 cursor-pointer hover:border-[hsl(var(--verified))]/40 transition-colors"
    >
      <div>
        <p className="font-semibold">{profile.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(profile.created_at)}</p>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href={selectStyleHref}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select a style for ${profile.name}`}
          className="text-[hsl(var(--verified))] hover:opacity-75 transition-opacity"
        >
          <Scissors className="h-5 w-5" />
        </Link>
        <Link
          href={`/measurements/manual?id=${profile.id}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Edit ${profile.name}`}
          className="text-foreground hover:text-[hsl(var(--verified))] transition-colors"
        >
          <Pencil className="h-5 w-5" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={deleting}
          aria-label={`Delete ${profile.name}`}
          className="text-foreground hover:text-[hsl(var(--rust))] transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
