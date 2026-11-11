import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, HeartHandshake, Menu, X } from 'lucide-react';

const links = [['The idea', '#our-story'], ['What to give', '#donate'], ['Our people', '#our-team'], ['Past drives', '#our-drives']];

export function Navigation({ onDonate }: { onDonate: () => void }) {
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); menuToggle.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#home" aria-label="Share The Care home"><span className="brand-icon"><HeartHandshake size={34} strokeWidth={1.65} /></span><span>share<br /><strong>the care.</strong></span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
        <div className="header-actions"><button className="button button-green header-donate" onClick={onDonate}>Give with us <ArrowUpRight size={17} /></button><button ref={menuToggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
      </div>
      {open && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={19} /></a>)}<button className="button button-orange" onClick={() => { setOpen(false); onDonate(); }}>Ask about a pickup <ArrowUpRight size={17} /></button></nav>}
    </header>
  );
}
