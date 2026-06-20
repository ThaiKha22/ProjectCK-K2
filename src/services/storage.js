// services/storage.js — Supabase-backed data helpers
import { supabase } from './supabase';

function normalizeCustomer(item) {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    company: item.company,
    status: item.status,
    createdAt: item.created_at || item.createdAt || '',
  };
}

function normalizeInteraction(item) {
  const normalizedDate = item.date || item.created_at || item.createdAt || '';

  return {
    id: item.id,
    customerId: item.customer_id || item.customerId || '',
    type: item.type,
    content: item.content || '',
    date: normalizedDate,
    createdAt: item.created_at || item.createdAt || normalizedDate,
  };
}

function normalizeTask(item) {
  return {
    id: item.id,
    customerId: item.customer_id || item.customerId || '',
    title: item.title,
    assignee: item.assignee,
    dueDate: item.due_date || item.dueDate || '',
    status: item.status,
  };
}

export async function hydrateCustomersFromSupabase() {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Supabase customers error:', error);
    return [];
  }
  return Array.isArray(data) ? data.map(normalizeCustomer) : [];
}

export async function hydrateInteractionsFromSupabase() {
  const { data, error } = await supabase.from('interactions').select('*');
  if (error) {
    console.error('Supabase interactions error:', error);
    return [];
  }
  return Array.isArray(data) ? data.map(normalizeInteraction) : [];
}

export async function hydrateTasksFromSupabase() {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) {
    console.error('Supabase tasks error:', error);
    return [];
  }
  return Array.isArray(data) ? data.map(normalizeTask) : [];
}

export function genId(prefix = 'id') {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
}
