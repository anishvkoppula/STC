import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PickupDialog } from '../components/pickup-dialog';

afterEach(() => vi.unstubAllGlobals());

function openRequest() {
  render(<PickupDialog open onOpenChange={() => {}} onReturnFocus={() => {}} />);
}

function fillRequest() {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: ' Sam & Alex ' } });
  fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'sam@example.com' } });
  fireEvent.change(screen.getByLabelText('Your neighborhood'), { target: { value: ' The Bridges ' } });
  fireEvent.change(screen.getByLabelText('Pickup address'), { target: { value: ' 123 Example Lane, San Ramon, CA ' } });
  fireEvent.change(screen.getByLabelText('What would you like to give?'), { target: { value: ' Two bags of clothing & canned food ' } });
}

describe('Pickup request delivery', () => {
  it('sends all donor details to Gmail with the donor as Reply-To', async () => {
    const send = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: 'true', message: 'The form was submitted successfully.' })));
    vi.stubGlobal('fetch', send);
    openRequest();
    fillRequest();
    fireEvent.click(screen.getByRole('button', { name: 'Send pickup request' }));

    expect(await screen.findByRole('status')).toHaveTextContent(/request submitted/i);
    expect(send).toHaveBeenCalledOnce();
    const [url, request] = send.mock.calls[0];
    expect(url).toBe('https://formsubmit.co/ajax/anishkoppula@gmail.com');
    expect(request.method).toBe('POST');
    expect(JSON.parse(request.body)).toMatchObject({
      name: 'Sam & Alex',
      email: 'sam@example.com',
      neighborhood: 'The Bridges',
      address: '123 Example Lane, San Ramon, CA',
      items: 'Two bags of clothing & canned food',
      _replyto: 'sam@example.com',
      _subject: 'Pickup request — The Bridges',
      _template: 'table',
      _honey: '',
    });
    expect(screen.queryByText(/pickup confirmed/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send pickup request' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send another request' }));
    expect(screen.getByLabelText('Your name')).toHaveValue('');
  });

  it.each([
    ['Your name', '   '],
    ['Your email', 'not-an-email'],
    ['Your neighborhood', '   '],
    ['Pickup address', '   '],
    ['What would you like to give?', '   '],
  ])('does not send an invalid %s', async (label, value) => {
    const send = vi.fn();
    vi.stubGlobal('fetch', send);
    openRequest();
    fillRequest();
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Send pickup request' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(label)).toHaveFocus();
    expect(send).not.toHaveBeenCalled();
  });

  it('prevents duplicate submissions while sending', async () => {
    let finish!: (response: Response) => void;
    const send = vi.fn().mockImplementation(() => new Promise<Response>(resolve => { finish = resolve; }));
    vi.stubGlobal('fetch', send);
    openRequest();
    fillRequest();
    const button = screen.getByRole('button', { name: 'Send pickup request' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    fireEvent.submit(button.closest('form')!);
    expect(send).toHaveBeenCalledOnce();
    finish(new Response(JSON.stringify({ success: true, message: 'The form was submitted successfully.' })));
    expect(await screen.findByRole('status')).toHaveTextContent(/request submitted/i);
  });

  it.each([
    ['a service rejection', { success: 'false', message: 'Please try again.' }, 200],
    ['a missing confirmation', { message: 'Something went wrong.' }, 200],
    ['an HTTP error', { success: true, message: 'Unavailable.' }, 503],
    ['a pending activation', { success: 'false', message: 'This form needs Activation.' }, 200],
    ['an activation response marked successful', { success: 'true', message: 'A confirmation email has been sent. The form will be actived shortly.' }, 200],
  ])('preserves entries after %s and allows retry', async (_name, body, status) => {
    const send = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, message: 'The form was submitted successfully.' })));
    vi.stubGlobal('fetch', send);
    openRequest();
    fillRequest();
    fireEvent.click(screen.getByRole('button', { name: 'Send pickup request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t confirm/i);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Your email')).toHaveValue('sam@example.com');
    expect(screen.getByLabelText('Pickup address')).toHaveValue(' 123 Example Lane, San Ramon, CA ');
    expect(screen.getByRole('link', { name: 'Email our team' })).toHaveAttribute('href', expect.stringContaining('mailto:anishkoppula@gmail.com?'));
    fireEvent.click(screen.getByRole('button', { name: 'Send pickup request' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/request submitted/i);
  });

  it('keeps the request available after a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
    openRequest();
    fillRequest();
    fireEvent.click(screen.getByRole('button', { name: 'Send pickup request' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t confirm/i));
    expect(screen.getByLabelText('Your name')).toHaveValue(' Sam & Alex ');
    expect(screen.getByRole('button', { name: 'Send pickup request' })).toBeEnabled();
  });
});
