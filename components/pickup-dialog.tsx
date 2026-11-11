import { useState } from 'react';
import { ArrowUpRight, HeartHandshake, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export function PickupDialog({ open, onOpenChange, onReturnFocus }: { open: boolean; onOpenChange: (open: boolean) => void; onReturnFocus: () => void }) {
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [items, setItems] = useState('');
  const [attempted, setAttempted] = useState(false);
  const ready = Boolean(name.trim() && neighborhood.trim() && items.trim());
  const body = `Hi Share The Care!\n\nI'd like to ask about a donation pickup.\n\nName: ${name.trim()}\nNeighborhood: ${neighborhood.trim()}\nItems: ${items.trim()}\n\nCould you let me know about upcoming pickups and how to prepare my donation?\n\nThank you!`;
  const mailto = `mailto:anishkoppula@gmail.com?subject=${encodeURIComponent(`Pickup inquiry — ${neighborhood.trim() || 'San Ramon'}`)}&body=${encodeURIComponent(body)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel="Close pickup inquiry" onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }}>
        <div className="dialog-mark"><HeartHandshake size={28} strokeWidth={1.5} /></div>
        <p className="eyebrow">GOOD STARTS WITH HELLO</p>
        <DialogTitle className="dialog-title">A little care<br /><em>starts here.</em></DialogTitle>
        <DialogDescription className="dialog-description">
          Tell us what you have in mind. We’ll open your email app with a draft for our team. Send it there, and we’ll help with the next steps.
        </DialogDescription>
        <div className="inquiry-fields">
          <label>Your name<input autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} placeholder="First name" aria-invalid={attempted && !name.trim()} required /></label>
          <label>Your neighborhood<input autoComplete="address-level3" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="e.g. The Bridges, San Ramon" aria-invalid={attempted && !neighborhood.trim()} required /></label>
          <label>What would you like to give?<textarea value={items} onChange={e => setItems(e.target.value)} placeholder="Clothes, canned or packaged food, or a question…" aria-invalid={attempted && !items.trim()} rows={3} required /></label>
        </div>
        {attempted && !ready && <p className="field-error" role="alert">Add your name, neighborhood, and donation details to prepare your email.</p>}
        <a className="button button-orange inquiry-submit" href={mailto} onClick={e => { if (!ready) { e.preventDefault(); setAttempted(true); } }}>
          <Mail size={17} /> Open email draft <ArrowUpRight size={18} />
        </a>
        <p className="dialog-footnote">A pickup is arranged directly with our team. Prefer to call? <a href="tel:+16506806214">(650) 680-6214</a></p>
      </DialogContent>
    </Dialog>
  );
}
