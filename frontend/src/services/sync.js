import supabase from '../lib/supabaseClient';
import { authAPI, productsAPI, cartAPI } from '../api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function syncUpdate(table, id, fields) {
  if (supabase) {
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

  const response = await fetch(`/api/${table}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Update failed' }));
    throw new Error(err.message || 'Update failed');
  }

  return response.json();
}

export async function syncInsert(table, fields) {
  if (supabase) {
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

  const response = await fetch(`/api/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Insert failed' }));
    throw new Error(err.message || 'Insert failed');
  }

  return response.json();
}

export async function syncDelete(table, id) {
  if (supabase) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Supabase delete failed');
    }

    return true;
  }

  const response = await fetch(`/api/${table}/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(err.message || 'Delete failed');
  }

  return true;
}
