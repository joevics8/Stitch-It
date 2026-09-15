import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CustomizeForm } from '@/components/customize/CustomizeForm';
import { type Style } from '@/lib/styles';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Customize Your Order' };
}

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: { styleId: string };
  searchParams: { measurementId?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/customize/${params.styleId}${searchParams.measurementId ? `?measurementId=${searchParams.measurementId}` : ''}`);

  const { data: style } = await supabase.from('styles').select('*').eq('id', params.styleId).single();
  if (!style) notFound();

  let measurementProfile: { id: string; name: string } | null = null;
  if (searchParams.measurementId) {
    const { data: profile } = await supabase
      .from('measurement_profiles')
      .select('id, name')
      .eq('id', searchParams.measurementId)
      .single();
    measurementProfile = profile ?? null;
  }

  const { data: allProfiles } = await supabase
    .from('measurement_profiles')
    .select('id, name')
    .order('created_at', { ascending: false });

  return (
    <CustomizeForm
      style={style as Style}
      initialMeasurementProfile={measurementProfile}
      allMeasurementProfiles={allProfiles ?? []}
    />
  );
}
