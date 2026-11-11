'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Hand, Shirt } from 'lucide-react';
import { drives, type Drive } from '@/src/data';

export function ClothingRail({ onDonate, onExplore }: { onDonate: () => void; onExplore: (drive: Drive) => void }) {
  const [selected, setSelected] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ startX: 0, scrollLeft: 0, active: false, moved: false });
  const current = drives[selected];
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      setAtStart(element.scrollLeft < 5);
      setAtEnd(element.scrollLeft + element.clientWidth >= element.scrollWidth - 5);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, []);
  const pointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { startX: e.clientX, scrollLeft: e.currentTarget.scrollLeft, active: true, moved: false };
  };
  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    if ((e.buttons & 1) === 0) { drag.current.active = false; return; }
    const distance = e.clientX - drag.current.startX;
    if (Math.abs(distance) > 6) {
      drag.current.moved = true;
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.scrollLeft = drag.current.scrollLeft - distance;
    }
  };
  const scroll = (direction: number) => track.current?.scrollBy({ left: direction * 440, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });

  return (
    <div className="clothing-experience">
      <div className="rail-toolbar"><span><Hand size={15} /> SLIDE THE RAIL. TAP A DRIVE. SEE THE GOOD.</span><div className="rail-arrows"><button aria-label="Slide clothing rail left" disabled={atStart} onClick={() => scroll(-1)}><ArrowLeft size={20} /></button><button aria-label="Slide clothing rail right" disabled={atEnd} onClick={() => scroll(1)}><ArrowRight size={20} /></button></div></div>
      <div className="rail-viewport" ref={track} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { drag.current.active = false; }} onPointerCancel={() => { drag.current.active = false; }} onLostPointerCapture={() => { drag.current.active = false; }} onClickCapture={e => { if (drag.current.moved && e.detail > 0) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }} onScroll={e => { const el = e.currentTarget; setAtStart(el.scrollLeft < 5); setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5); }}>
        <div className="rail-track"><div className="rail-pole" aria-hidden="true" />{drives.map((drive, i) => (
          <button key={drive.id} className={`garment ${i === selected ? 'is-selected' : ''}`} aria-label={`Explore ${drive.community} Drive`} aria-pressed={selected === i} aria-haspopup="dialog" onClick={() => { setSelected(i); onExplore(drive); }} style={{ '--piece': drive.garment, '--swing': `${i % 2 ? 3 : -3}deg` } as CSSProperties}>
            <span className="garment-photo" aria-hidden="true" />
            <span className="garment-tag" aria-hidden="true">{`${drive.community} Drive`.split(' ').map((word, j) => <span key={j}>{word}</span>)}<ArrowUpRight size={13} /></span>
            <span className="garment-caption"><span className="garment-index">0{i + 1}</span>{drive.community} Drive<ArrowUpRight size={14} /></span>
          </button>
        ))}</div>
      </div>
      <div className="rail-detail" aria-live="polite" aria-atomic="true"><span className="rail-detail-icon"><Shirt size={25} strokeWidth={1.4} /></span><div><span className="eyebrow">DRIVE IMPACT · 2025 DRIVES</span><h3>{current.community} Drive</h3><p>{current.households} households shared {current.clothing} clothing items, {current.cans} cans, and {current.packagedFood} packaged food items. Tap a garment to see the whole story.</p></div><div className="rail-detail-actions"><button className="text-link" onClick={() => onExplore(current)}>View drive story <ArrowUpRight size={17} /></button><button className="text-link" onClick={onDonate}>Give Fresh Start <ArrowUpRight size={18} /></button></div></div>
    </div>
  );
}
