import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, selectedTags } = req.body;

  // 1. Save selection
  const { data: selection, error } = await supabase
    .from('user_selections')
    .insert([{ user_id: userId, selected_tags: selectedTags }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });

  // 2. Query top 10 cities
  const { data: cities, error: cityErr } = await supabase.rpc('get_recommended_cities', {
    input_tags: selectedTags
  });

  if (cityErr) return res.status(500).json({ error: cityErr });

  // 3. Save recommendations
  const recs = cities.map((c: any) => ({
    selection_id: selection.id,
    city: c.city,
  }));

  await supabase.from('recommendations').insert(recs);

  res.status(200).json({ cities: cities.map((c: any) => c.city) });
}
