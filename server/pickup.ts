import { createHash } from 'node:crypto';
import { env } from 'node:process';
import { isValidPickupEmail } from '../lib/pickup-email.js';

const limits = { name: 100, email: 254, neighborhood: 150, address: 300, items: 5000 } as const;
type Field = keyof typeof limits;
const maxBodyBytes = 32_768;

function reply(status: number, body: object, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } });
}

export async function handlePickup(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { success: false }, { Allow: 'POST' });
  const allowedOrigins = (env.PICKUP_ALLOWED_ORIGINS || 'https://srsharethecare.org,https://www.srsharethecare.org').split(',').map(value => value.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  if (!origin || !allowedOrigins.includes(origin)) return reply(403, { success: false });
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reply(415, { success: false });
  }
  if (Number(request.headers.get('Content-Length')) > maxBodyBytes) return reply(413, { success: false });
  const token = env.AIRTABLE_ACCESS_TOKEN;
  const base = env.AIRTABLE_BASE_ID;
  const table = env.AIRTABLE_TABLE_ID;
  // Enable only after the database and the connected Gmail automation have been tested.
  if (env.PICKUP_ACCEPTING_REQUESTS !== 'true' || !token || !base || !table) {
    return reply(503, { success: false }, { 'Retry-After': '60' });
  }

  let input: Record<string, unknown>;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > maxBodyBytes) return reply(413, { success: false });
    input = JSON.parse(text);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { success: false });
  } catch {
    return reply(400, { success: false });
  }

  const details = {} as Record<Field, string>;
  for (const field of Object.keys(limits) as Field[]) {
    const value = input[field];
    if (typeof value !== 'string' || !value.trim() || value.length > limits[field] || value.includes('\0')) {
      return reply(400, { success: false });
    }
    details[field] = value.trim();
    if (field !== 'items' && /[\r\n]/.test(value)) return reply(400, { success: false });
  }
  if (!isValidPickupEmail(details.email)
    || typeof input.submissionId !== 'string'
    || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.submissionId)
    || (input.website !== undefined && input.website !== '')) {
    return reply(400, { success: false });
  }

  // Include normalized contents so editing an uncertain submission cannot overwrite another intake.
  const submissionKey = createHash('sha256').update(JSON.stringify([input.submissionId, details])).digest('hex');
  const reference = `STC-${submissionKey.slice(0, 12).toUpperCase()}`;
  try {
    const endpoint = `https://api.airtable.com/v0/${encodeURIComponent(base)}/${encodeURIComponent(table)}`;
    const signal = AbortSignal.timeout(12_000);
    const lookupUrl = new URL(endpoint);
    lookupUrl.searchParams.set('filterByFormula', `{Submission key}="${submissionKey}"`);
    lookupUrl.searchParams.set('maxRecords', '2');
    lookupUrl.searchParams.append('fields[]', 'Request ID');
    const lookup = await fetch(lookupUrl.toString(), {
      method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal, cache: 'no-store',
    });
    const existing = await lookup.json();
    if (!lookup.ok || !Array.isArray(existing?.records) || existing.records.length > 1) {
      return reply(502, { success: false }, { 'Retry-After': '30' });
    }
    if (existing.records.length === 1) {
      if (typeof existing.records[0]?.id !== 'string' || !existing.records[0].id.startsWith('rec')) {
        return reply(502, { success: false }, { 'Retry-After': '30' });
      }
      // A normal retry never rewrites a saved request, including staff corrections.
      return reply(200, { success: true, reference });
    }
    const saved = await fetch(endpoint, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        performUpsert: { fieldsToMergeOn: ['Submission key'] },
        records: [{ fields: {
          'Request ID': reference, 'Submission key': submissionKey,
          Name: details.name, Email: details.email, Neighborhood: details.neighborhood,
          'Pickup address': details.address, 'Donation details': details.items, Source: 'Website',
        } }],
      }),
    });
    const result = await saved.json();
    if (!saved.ok || result?.details || !Array.isArray(result?.records) || result.records.length !== 1
      || typeof result.records[0]?.id !== 'string' || !result.records[0].id.startsWith('rec')) {
      return reply(502, { success: false }, { 'Retry-After': '30' });
    }
    return reply(200, { success: true, reference });
  } catch {
    // Do not echo Airtable errors, credentials, or donor details into responses or logs.
    return reply(502, { success: false }, { 'Retry-After': '30' });
  }
}
