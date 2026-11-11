import { useRef } from 'react';
import { ArrowUpRight, Check, MapPin } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DriveMapCredit } from '@/components/drive-map-credit';
import type { Drive } from '@/src/data';

export function DriveImpactDialog({ drive, onClose, onReturnFocus }: {
  drive: Drive | null; onClose: () => void; onReturnFocus: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  if (!drive) return null;
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="impact-dialog" closeLabel="Close drive story"
        onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus({ preventScroll: true }); }}
        onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }}>
        <p className="impact-location"><MapPin size={13} /> SAN RAMON · {drive.date}</p>
        <DialogTitle ref={title} tabIndex={-1} className="dialog-title">{drive.community} Drive</DialogTitle>
        <DialogDescription className="impact-intro">{drive.summary}</DialogDescription>
        <div className="impact-stats">{[
          [drive.households, 'Households shared'], [drive.clothing, 'Clothing items'],
          [drive.cans, 'Cans collected'], [drive.packagedFood, 'Packaged food items'],
        ].map(([number, label]) => <div key={label}><strong>{number}</strong><span>{label}</span></div>)}</div>
        <section className="impact-donations" aria-labelledby="donated-title">
          <h3 id="donated-title">What we donated</h3>
          <div><span>Clothing</span><p>{drive.clothingDetails}</p></div>
          <div><span>Canned &amp; packaged food</span><p>{drive.foodDetails}</p></div>
        </section>
        <section className="impact-story" aria-labelledby="story-detail-title">
          <h3 id="story-detail-title">How the day unfolded</h3>
          <ol>{drive.story.map((step, index) => <li key={step.title}><span>0{index + 1}</span><div><h4>{step.title}</h4><p>{step.description}</p></div></li>)}</ol>
        </section>
        <section className="impact-route" aria-labelledby="impact-route-title">
          <div className="impact-route-heading"><h3 id="impact-route-title">Explore the route</h3><span className="archive-chip">Collection area</span></div>
          <a href={drive.mapSrc} target="_blank" rel="noreferrer" aria-label={`Open full ${drive.community} map`}><img src={drive.mapSrc} alt={`Collection map for ${drive.community}`} width="960" height="600" /></a>
          <DriveMapCredit drive={drive} />
          <ul>{drive.streets.map(street => <li key={street}><Check size={14} /> {street}</li>)}</ul>
          <a className="map-full-link" href={drive.mapSrc} target="_blank" rel="noreferrer">View the full map <ArrowUpRight size={14} /></a>
        </section>
        <DialogClose asChild><button className="text-link impact-back">Back to the drives <ArrowUpRight size={16} /></button></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
