import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handlePickup } from '../server/pickup';

const donor = {
  name: ' Sam & Alex ', email: 'sam@example.com', neighborhood: ' The Bridges ',
  address: ' 123 Example Lane, San Ramon, CA ', items: ' Two bags of clothing & canned food ',
  submissionId: '7f28c5ec-6f05-49c7-b935-5e394711d034', website: '',
};

function request(body: unknown = donor, origin = 'https://srsharethecare.org') {
  return new Request('https://srsharethecare.org/api/pickup', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body),
  });
}

function saved() {
  return new Response(JSON.stringify({
    records: [{ id: 'recExample', createdTime: '2026-11-19T12:00:00.000Z', fields: {} }],
    createdRecords: ['recExample'], updatedRecords: [],
  }));
}

function emptyLookup() {
  return new Response(JSON.stringify({ records: [] }));
}

beforeEach(() => {
  vi.stubEnv('PICKUP_ACCEPTING_REQUESTS', 'true');
  vi.stubEnv('AIRTABLE_ACCESS_TOKEN', 'test-server-token');
  vi.stubEnv('AIRTABLE_BASE_ID', 'appExample');
  vi.stubEnv('AIRTABLE_TABLE_ID', 'tblExample');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Pickup intake API', () => {
  it('saves donor details privately and returns a reference without exposing them', async () => {
    const send = vi.fn().mockImplementation(async (_url, init) => init.method === 'GET' ? emptyLookup() : saved());
    vi.stubGlobal('fetch', send);
    const response = await handlePickup(request());
    expect(response.status).toBe(200);
    const receipt = await response.json();
    expect(receipt).toEqual({ success: true, reference: expect.stringMatching(/^STC-[A-F0-9]{12}$/) });
    expect(send).toHaveBeenCalledTimes(2);
    const [url, init] = send.mock.calls[1];
    expect(url).toBe('https://api.airtable.com/v0/appExample/tblExample');
    expect(init.method).toBe('PATCH');
    expect(init.headers.Authorization).toBe('Bearer test-server-token');
    const body = JSON.parse(init.body);
    expect(body.performUpsert).toEqual({ fieldsToMergeOn: ['Submission key'] });
    expect(body.records[0].fields).toEqual({
      'Request ID': receipt.reference,
      'Submission key': expect.stringMatching(/^[a-f0-9]{64}$/),
      Name: 'Sam & Alex', Email: 'sam@example.com', Neighborhood: 'The Bridges',
      'Pickup address': '123 Example Lane, San Ramon, CA',
      'Donation details': 'Two bags of clothing & canned food', Source: 'Website',
    });
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(JSON.stringify(receipt)).not.toContain('sam@example.com');
  });

  it('returns an existing receipt without rewriting corrected donor details or staff workflow fields', async () => {
    let stored = false;
    const send = vi.fn().mockImplementation(async (_url, init) => {
      if (init.method === 'GET') return new Response(JSON.stringify({ records: stored ? [{ id: 'recExample', fields: { 'Pickup address': 'Corrected by volunteer', Status: 'Scheduled' } }] : [] }));
      stored = true;
      return saved();
    });
    vi.stubGlobal('fetch', send);
    const first = await handlePickup(request());
    const retry = await handlePickup(request({ ...donor, name: 'Sam & Alex' }));
    expect(await first.json()).toEqual(await retry.json());
    const writes = send.mock.calls.filter(([, init]) => init.method === 'PATCH');
    expect(writes).toHaveLength(1);
    const firstBody = JSON.parse(writes[0][1].body);
    for (const field of ['Status', 'Notes', 'Assigned volunteer', 'Confirmation status', 'Notification status']) {
      expect(firstBody.records[0].fields).not.toHaveProperty(field);
    }
  });

  it.each([
    { ...donor, name: '   ' }, { ...donor, email: 'not-an-email' },
    { ...donor, email: 'sam@exa_mple.com' }, { ...donor, email: 'sam@exa,mple.com' },
    { ...donor, email: 'sam@example' },
    { ...donor, email: 'sam@example.com\r\nBcc:someone@example.com' },
    { ...donor, neighborhood: '' }, { ...donor, address: '   ' },
    { ...donor, items: '' }, { ...donor, items: 'x'.repeat(5001) },
    { ...donor, submissionId: 'not-a-uuid' }, { ...donor, website: 'spam.example' },
    null, { name: ['Sam'] },
  ])('rejects invalid intake %# without calling Airtable', async body => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    const response = await handlePickup(request(body));
    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects cross-origin submission before it can store or email anything', async () => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect((await handlePickup(request(donor, 'https://unrelated.example'))).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a missing origin even if the configured allowlist has an empty entry', async () => {
    vi.stubEnv('PICKUP_ALLOWED_ORIGINS', 'https://srsharethecare.org,');
    const send = vi.fn().mockResolvedValue(saved());
    vi.stubGlobal('fetch', send);
    expect((await handlePickup(request(donor, ''))).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects oversized and malformed JSON requests', async () => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    const tooLarge = request({ ...donor, ignored: 'x'.repeat(33_000) });
    expect((await handlePickup(tooLarge)).status).toBe(413);
    const malformed = new Request('https://srsharethecare.org/api/pickup', {
      method: 'POST', headers: { Origin: 'https://srsharethecare.org', 'Content-Type': 'application/json' }, body: '{bad json',
    });
    expect((await handlePickup(malformed)).status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('does not expose stored donor records through GET', async () => {
    const response = await handlePickup(new Request('https://srsharethecare.org/api/pickup'));
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it.each(['PICKUP_ACCEPTING_REQUESTS', 'AIRTABLE_ACCESS_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_ID'])('fails closed without %s', async key => {
    vi.stubEnv(key, '');
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    expect((await handlePickup(request())).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    new Response(JSON.stringify({ error: { type: 'INVALID_PERMISSIONS', message: 'private upstream error' } }), { status: 403 }),
    new Response(JSON.stringify({ records: [] })),
    new Response('<html>upstream error</html>'),
  ])('does not acknowledge a failed or unconfirmed save %#', async upstream => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstream));
    const response = await handlePickup(request());
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).not.toContain('private upstream error');
    expect(body).not.toContain('test-server-token');
  });

  it('returns a retryable failure after a network timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')));
    expect((await handlePickup(request())).status).toBe(502);
  });

  it.each([
    [403, { error: { message: 'private write failure' } }],
    [200, { records: [] }],
  ])('does not acknowledge a rejected write after a successful lookup %#', async (status, body) => {
    const send = vi.fn()
      .mockResolvedValueOnce(emptyLookup())
      .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', send);
    const response = await handlePickup(request());
    expect(response.status).toBe(502);
    expect(send).toHaveBeenCalledTimes(2);
    expect(await response.text()).not.toContain('private write failure');
  });
});
