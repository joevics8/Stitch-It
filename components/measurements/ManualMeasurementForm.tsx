'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { MEASUREMENT_FIELDS, type MeasurementProfile } from '@/lib/measurements';

type FormValues = { name: string } & Record<string, string>;

function emptyValues(): FormValues {
  const values: FormValues = { name: '' };
  for (const field of MEASUREMENT_FIELDS) values[field.key] = '';
  return values;
}

export function ManualMeasurementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [values, setValues] = useState<FormValues>(emptyValues());
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const supabase = createClient();
    supabase
      .from('measurement_profiles')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError || !data) {
          setError("Couldn't load this measurement profile.");
          setLoading(false);
          return;
        }
        const row = data as MeasurementProfile;
        const next = emptyValues();
        next.name = row.name;
        for (const field of MEASUREMENT_FIELDS) {
          const raw = row[field.key];
          next[field.key] = raw === null || raw === undefined ? '' : String(raw);
        }
        setValues(next);
        setLoading(false);
      });
  }, [editId]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('Please give this measurement profile a name.');
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login?redirect=/measurements/manual');
      return;
    }

    const payload: Record<string, unknown> = { name: values.name.trim(), source: 'manual' };
    for (const field of MEASUREMENT_FIELDS) {
      const raw = values[field.key];
      payload[field.key] = raw === '' ? null : Number(raw);
    }

    const result = editId
      ? await supabase.from('measurement_profiles').update(payload).eq('id', editId)
      : await supabase.from('measurement_profiles').insert({ ...payload, user_id: user.id });

    setSaving(false);
    if (result.error) {
      setError('Could not save this measurement. Please try again.');
      return;
    }
    router.push('/measurements');
    router.refresh();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-32">
      <Link href="/measurements" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
        {editId ? 'Edit Measurements' : 'Enter Measurements Manually'}
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading&hellip;
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-sm border border-[hsl(var(--rust))] bg-[hsl(var(--rust))]/5 p-3 text-sm text-[hsl(var(--rust))]">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6">
            <Label htmlFor="name" className="text-sm font-semibold">
              Name
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Suit, Agbada, Emma's Measurements"
              required
              className="mt-1.5"
            />
          </div>

          <div className="space-y-3">
            {MEASUREMENT_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label
                  htmlFor={field.key}
                  className="flex-1 rounded-sm bg-[hsl(var(--verified))] text-white text-sm font-medium px-3.5 py-2.5"
                >
                  {field.label}
                </label>
                <Input
                  id={field.key}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={values[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder="cm"
                  className="w-28 shrink-0"
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full mt-8" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Measurements
          </Button>
        </form>
      )}
    </div>
  );
}
