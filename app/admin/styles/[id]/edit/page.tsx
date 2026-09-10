import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StyleForm } from '@/components/admin/StyleForm';
import type { Style } from '@/lib/styles';

export default async function EditStylePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('styles').select('*').eq('id', params.id).single();
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Edit Style</h1>
      <StyleForm style={data as Style} />
    </div>
  );
}
