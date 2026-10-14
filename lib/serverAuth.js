// lib/serverAuth.js
import { supabaseAdmin } from './supabase';

export async function getUserFromAuthHeader(authorization) {
  if (!authorization) return null;
  const match = authorization.match(/Bearer (.+)/);
  if (!match) return null;
  const token = match[1];

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.warn('Failed to get user from token', error.message);
      return null;
    }
    return data.user || null;
  } catch (err) {
    console.error('getUserFromAuthHeader error', err);
    return null;
  }
}
