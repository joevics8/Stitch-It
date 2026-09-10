import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, type Style } from '@/lib/styles';
import { DeleteStyleButton } from '@/components/admin/DeleteStyleButton';

export const dynamic = 'force-dynamic';

export default async function AdminStylesPage() {
  const supabase = createClient();
  const { data } = await supabase.from('styles').select('*').order('created_at', { ascending: false });
  const styles = (data ?? []) as Style[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold">Styles ({styles.length})</h1>
        <Link
          href="/admin/styles/new"
          className="flex items-center gap-2 rounded-sm bg-[hsl(var(--verified))] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Style
        </Link>
      </div>

      {styles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No styles yet. Add your first one.</p>
      ) : (
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {styles.map((style) => (
                <tr key={style.id}>
                  <td className="px-4 py-3 font-medium max-w-[220px] truncate">{style.name}</td>
                  <td className="px-4 py-3 capitalize">{style.gender}</td>
                  <td className="px-4 py-3 capitalize">{style.category}</td>
                  <td className="px-4 py-3">{formatNaira(style.price)}</td>
                  <td className="px-4 py-3">{style.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/styles/${style.id}/edit`}
                      className="text-[hsl(var(--verified))] font-medium mr-4"
                    >
                      Edit
                    </Link>
                    <DeleteStyleButton styleId={style.id} styleName={style.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
