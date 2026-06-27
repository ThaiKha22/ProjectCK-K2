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

function normalizeCustomerPayload(customer) {
  const payload = {
    ...customer,
    id: customer.id || genId('c'),
  };

  if (customer.createdAt && !customer.created_at) {
    payload.created_at = customer.createdAt;
  }

  delete payload.createdAt;

  return payload;
}

async function getNextInteractionId() {
  const interactions = await hydrateInteractionsFromSupabase();

  const maxNumber = interactions.reduce((max, interaction) => {
    const match = String(interaction.id || '').match(/^i(\d+)$/);

    if (!match) return max;

    const number = Number(match[1]);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `i${maxNumber + 1}`;
}

async function getNextTaskId() {
  const tasks = await hydrateTasksFromSupabase();

  const maxNumber = tasks.reduce((max, task) => {
    const match = String(task.id || '').match(/^t(\d+)$/);

    if (!match) return max;

    const number = Number(match[1]);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `t${maxNumber + 1}`;
}

async function normalizeTaskPayload(task) {
  const nextId = task.id || await getNextTaskId();

  const payload = {
    ...task,
    id: nextId,
  };

  if (task.customerId && !task.customer_id) {
    payload.customer_id = task.customerId;
  }

  if (task.dueDate && !task.due_date) {
    payload.due_date = task.dueDate;
  }

  delete payload.customerId;
  delete payload.dueDate;

  return payload;
}

async function normalizeInteractionPayload(interaction) {
  const nextId = interaction.id || await getNextInteractionId();

  return {
    id: nextId,
    customer_id: interaction.customerId || interaction.customer_id || '',
    type: interaction.type,
    content: interaction.content || '',
    interaction_date:
      interaction.interactionDate ||
      interaction.interaction_date ||
      interaction.date ||
      null,
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

export async function createCustomer(customer) {
  const payload = normalizeCustomerPayload(customer);
  const { data, error } = await supabase
    .from('customers')
    .insert([payload])
    .select();

  if (error) throw error;
  return Array.isArray(data) ? data.map(normalizeCustomer) : [];
}

export async function updateCustomer(id, customer) {
  const payload = normalizeCustomerPayload(customer);

  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;

  return Array.isArray(data)
    ? data.map(normalizeCustomer)
    : [];
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}

export async function createInteraction(id, interaction) {
  const payload = await normalizeInteractionPayload(interaction);
  const { data, error } = await supabase
    .from('interactions')
    .insert([payload])
    .select();

  if (error) throw error;
  return Array.isArray(data) ? data.map(normalizeInteraction) : [];
}

export async function deleteInteraction(id) {
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}

export async function createTask(task) {
  const payload = await normalizeTaskPayload(task);
  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select();

  if (error) throw error;
  return Array.isArray(data) ? data.map(normalizeTask) : [];
}

export async function updateTask(id, task) {
  const payload = await normalizeTaskPayload(task);

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) throw error;

  return Array.isArray(data)
    ? data.map(normalizeTask)
    : [];
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}