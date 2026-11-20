import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { organizationEmail } from '@/lib/contact';
import { isValidPickupEmail } from '@/lib/pickup-email';

const emptyDetails = { name: '', email: '', neighborhood: '', address: '', items: '' };
type Field = keyof typeof emptyDetails;

export function PickupDialog({ open, onOpenChange, onReturnFocus }: { open: boolean; onOpenChange: (open: boolean) => void; onReturnFocus: () => void }) {
  const [details, setDetails] = useState(emptyDetails);
  const [errors, setErrors] = useState<Field[]>([]);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);
  const [reference, setReference] = useState('');
  const successMessage = useRef<HTMLDivElement>(null);
  const sending = status === 'sending';
  const body = `Hi Share The Care!\n\nI'd like to ask about a donation pickup.\n\nName: ${details.name.trim()}\nEmail: ${details.email.trim()}\nNeighborhood: ${details.neighborhood.trim()}\nPickup address: ${details.address.trim()}\nItems: ${details.items.trim()}\n\nCould you let me know about upcoming pickups and how to prepare my donation?\n\nThank you!`;
  const mailto = `mailto:${organizationEmail}?subject=${encodeURIComponent(`Pickup request — ${details.neighborhood.trim() || 'San Ramon'}`)}&body=${encodeURIComponent(body)}`;

  useEffect(() => {
    if (open && status === 'success') successMessage.current?.focus();
  }, [open, status]);

  function updateField(field: Field, value: string) {
    setDetails(previous => ({ ...previous, [field]: value }));
    setErrors(previous => previous.filter(error => error !== field));
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const fields = Object.keys(details) as Field[];
    const invalid = fields.filter(field => !details[field].trim() || !(form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement).validity.valid || (field === 'email' && !isValidPickupEmail(details.email)));
    setErrors(invalid);
    if (invalid.length) {
      (form.elements.namedItem(invalid[0]) as HTMLElement).focus();
      return;
    }

    inFlight.current = true;
    setStatus('sending');
    try {
      submissionId.current ??= crypto.randomUUID();
      const response = await fetch('/api/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          ...Object.fromEntries(fields.map(field => [field, details[field].trim()])),
          submissionId: submissionId.current,
          website: new FormData(form).get('website') || '',
        }),
      });
      const result = await response.json();
      if (!response.ok || result?.success !== true || typeof result?.reference !== 'string' || !/^STC-[A-F0-9]{12}$/.test(result.reference)) {
        throw new Error('Pickup request was not accepted');
      }
      setReference(result.reference);
      submissionId.current = null;
      setDetails(emptyDetails);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel="Close pickup inquiry" onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }}>
        <div className="dialog-mark"><BrandLogo /></div>
        <p className="eyebrow">GOOD STARTS WITH HELLO</p>
        <DialogTitle className="dialog-title">A little care<br /><em>starts here.</em></DialogTitle>
        <DialogDescription className="dialog-description">
          Tell us what you’d like to give and where we can pick it up. We’ll email you to arrange a date and time.
        </DialogDescription>
        {status === 'success' ? (
          <>
            <div className="inquiry-success" role="status" tabIndex={-1} ref={successMessage}>
              <CheckCircle2 size={27} aria-hidden="true" />
              <h3>Request submitted. Thank you!</h3>
              <p>Your reference: <strong>{reference}</strong></p>
              <p>Our team will email you to arrange your pickup. Your pickup date and time still need to be confirmed.</p>
            </div>
            <button type="button" className="button button-orange inquiry-submit" onClick={() => setStatus('idle')}>Send another request <ArrowUpRight size={18} /></button>
          </>
        ) : (
          <form onSubmit={submitRequest} noValidate aria-busy={sending}>
            <fieldset className="inquiry-fields" disabled={sending}>
              <legend className="sr-only">Your pickup request</legend>
              <label>Your name<input name="name" autoComplete="name" value={details.name} onChange={e => updateField('name', e.target.value)} placeholder="First name" maxLength={100} aria-invalid={errors.includes('name')} aria-describedby={errors.includes('name') ? 'pickup-field-error' : undefined} required /></label>
              <label>Your email<input name="email" type="email" autoComplete="email" value={details.email} onChange={e => updateField('email', e.target.value)} placeholder="you@example.com" maxLength={254} aria-invalid={errors.includes('email')} aria-describedby={errors.includes('email') ? 'pickup-field-error' : undefined} required /></label>
              <label>Your neighborhood<input name="neighborhood" autoComplete="address-level3" value={details.neighborhood} onChange={e => updateField('neighborhood', e.target.value)} placeholder="e.g. The Bridges, San Ramon" maxLength={150} aria-invalid={errors.includes('neighborhood')} aria-describedby={errors.includes('neighborhood') ? 'pickup-field-error' : undefined} required /></label>
              <label>Pickup address<input name="address" autoComplete="street-address" value={details.address} onChange={e => updateField('address', e.target.value)} placeholder="Street address, city, and ZIP code" maxLength={300} aria-invalid={errors.includes('address')} aria-describedby={errors.includes('address') ? 'pickup-field-error' : undefined} required /></label>
              <label>What would you like to give?<textarea name="items" value={details.items} onChange={e => updateField('items', e.target.value)} placeholder="Clothing, shelf-stable food, unopened hygiene products, baby essentials, or a question…" maxLength={5000} aria-invalid={errors.includes('items')} aria-describedby={errors.includes('items') ? 'pickup-field-error' : undefined} rows={3} required /></label>
              <input className="inquiry-honey" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </fieldset>
            {errors.length > 0 && <p className="field-error" id="pickup-field-error" role="alert">Please add your name, a valid email, neighborhood, pickup address, and donation details.</p>}
            {status === 'error' && <p className="field-error" role="alert">We couldn’t confirm your request was saved. Your details are still here. Please try again, <a href={mailto}>Email our team</a>, or call us below.</p>}
            <button type="submit" className="button button-orange inquiry-submit" disabled={sending}>
              <Mail size={17} /> {sending ? 'Sending…' : 'Send pickup request'} <ArrowUpRight size={18} />
            </button>
            <p className="dialog-privacy">Your details are stored in our private pickup tracker and used to coordinate your donation.</p>
          </form>
        )}
        <p className="dialog-footnote">A pickup is arranged directly with our team. Prefer to call? <a href="tel:+16506806214">(650) 680-6214</a></p>
      </DialogContent>
    </Dialog>
  );
}
