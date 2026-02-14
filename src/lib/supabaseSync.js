/**
 * Supabase cloud sync for ShredOS
 * Simple REST calls — no SDK needed
 */
const SUPABASE_URL = 'https://rrsireqttzowrmxklbmm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2lyZXF0dHpvd3JteGtsYm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODcxMTgsImV4cCI6MjA4NjU2MzExOH0.TQ4CsCKVOLNtwXED-mInerqBQR0D98QPakD5l0E1t6A';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=minimal'
};

/**
 * Generate a random 6-character sync code (uppercase + digits)
 */
export function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Save data to cloud (upsert)
 */
export async function saveToCloud(syncCode, data) {
  if (!syncCode) return false;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/shredos_sync?sync_code=eq.${syncCode}`,
      {
        method: 'GET',
        headers: { ...headers, 'Prefer': undefined, apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
      }
    );
    const existing = await response.json();

    if (existing.length > 0) {
      // Update
      await fetch(
        `${SUPABASE_URL}/rest/v1/shredos_sync?sync_code=eq.${syncCode}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ data, updated_at: new Date().toISOString() })
        }
      );
    } else {
      // Insert
      await fetch(
        `${SUPABASE_URL}/rest/v1/shredos_sync`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ sync_code: syncCode, data, updated_at: new Date().toISOString() })
        }
      );
    }
    return true;
  } catch (err) {
    console.error('Cloud sync error:', err);
    return false;
  }
}

/**
 * Load data from cloud
 */
export async function loadFromCloud(syncCode) {
  if (!syncCode) return null;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/shredos_sync?sync_code=eq.${syncCode}&select=data,updated_at`,
      {
        method: 'GET',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      }
    );
    const rows = await response.json();
    if (rows.length > 0) return rows[0];
    return null;
  } catch (err) {
    console.error('Cloud load error:', err);
    return null;
  }
}
