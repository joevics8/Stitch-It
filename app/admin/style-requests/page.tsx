import { createClient } from '@/lib/supabase/server';

interface StyleRequestRow {
  id: string;
  image_url: string | null;
  image_link: string | null;
  gender: string | null;
  for_self: boolean | null;
  description: string;
  customization: string | null;
  quantity: number;
  phone: string;
  delivery_location: string | null;
  status: string;
  created_at: string;
}

export const dynamic = 'force-dynamic';

export default async function AdminStyleRequestsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('style_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const requests = (data ?? []) as StyleRequestRow[];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Style Requests ({requests.length})</h1>

      {requests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-sm border border-border p-4 flex gap-4">
              {r.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image_url} alt="" className="h-24 w-20 object-cover rounded-sm shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-muted capitalize">
                    {r.status}
                  </span>
                </div>
                <p className="text-sm mb-1">{r.description}</p>
                {r.customization && (
                  <p className="text-xs text-muted-foreground mb-1">Customization: {r.customization}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {r.gender && <span className="capitalize">{r.gender}</span>}
                  {r.for_self !== null && ` · ${r.for_self ? 'For self' : 'For someone else'}`}
                  {` · Qty ${r.quantity}`}
                  {r.delivery_location && ` · ${r.delivery_location}`}
                </p>
                <p className="text-xs font-medium mt-1">
                  <a href={`tel:${r.phone}`} className="text-[hsl(var(--verified))]">
                    {r.phone}
                  </a>
                  {r.image_link && (
                    <>
                      {' · '}
                      <a href={r.image_link} target="_blank" rel="noreferrer" className="text-[hsl(var(--verified))]">
                        Reference link
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
