import supabase from '../lib/supabaseClient';

export async function syncUpdate(table, id, fields) {
  const { data, error } = await supabase
    .from(table)
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Supabase update failed');
  }

  return data;
}

export async function syncInsert(table, fields) {
  const { data, error } = await supabase
    .from(table)
    .insert(fields)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Supabase insert failed');
  }

  return data;
}

export async function syncDelete(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Supabase delete failed');
  }

  return true;
}
