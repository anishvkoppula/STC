import { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Asterisk, Heart, HeartHandshake, MapPin, PackageOpen, Shirt, Sprout } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { PickupDialog } from '@/components/pickup-dialog';
import { ParallaxComponent } from '@/components/ui/parallax-scrolling';
import { ClothingRail } from '@/components/ui/clothing-rail';
import { team, type Drive } from './data';
import { DriveImpactDialog } from '@/components/drive-impact-dialog';
import { PastDrives } from '@/components/past-drives';

export default function App() {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeDrive, setActiveDrive] = useState<Drive | null>(null);
  const driveTrigger = useRef<HTMLElement | null>(null);
  const openDrive = (drive: Drive) => {
    driveTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveDrive(drive);
  };
  const returnDriveFocus = () => driveTrigger.current?.isConnected && driveTrigger.current.focus();
  const inquiryTrigger = useRef<HTMLElement | null>(null);
  const openInquiry = () => {
    inquiryTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setInquiryOpen(true);
  };
  const returnInquiryFocus = () => {
    if (inquiryTrigger.current?.isConnected) inquiryTrigger.current.focus();
    else document.querySelector<HTMLButtonElement>('.header-donate')?.focus();
  };

  return (
    <div id="home">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation onDonate={openInquiry} />
      <main id="main-content" tabIndex={-1}>
        <div className="hero-wrap"><ParallaxComponent onDonate={openInquiry} /></div>

        <section className="story-section section-shell" id="our-story" aria-labelledby="story-title">
          <div className="section-label"><span className="label-line" /> NEIGHBORS HELPING NEIGHBORS <span className="section-number">01 / THE IDEA</span></div>
          <div className="story-grid"><h2 id="story-title">Small acts.<br /><em>Closer communities.</em><Asterisk className="story-asterisk" size={72} strokeWidth={1.1} /></h2><div className="story-copy"><p className="lead">Giving back shouldn’t mean<br className="desktop-break" /> going out of your way.</p><p>We’re Share The Care, a team of Dougherty Valley students making it easier for San Ramon neighbors to give. Through scheduled doorstep pickups, we connect the things you can spare with places that put them to good use.</p><p>Clothes you’ve outgrown. Shelf-stable food you can spare. Unopened hygiene products and baby essentials. A little generosity. It all starts right where you are.</p><a className="text-link" href="#how-it-works">A simple way to make a difference <ArrowDown size={17} /></a></div></div>
          <div className="steps" id="how-it-works">{[
            { number: '01', title: 'Find a little to give.', text: 'Find clothing, shelf-stable food, unopened hygiene products, or baby essentials you’d like to pass on.', icon: Shirt },
            { number: '02', title: 'Say hello to our team.', text: 'Ask about the next pickup in your neighborhood and the items we can collect.', icon: HeartHandshake },
            { number: '03', title: 'We’ll take it from here.', text: 'Arrange the details with our team. We collect from your doorstep, so giving fits into your day.', icon: PackageOpen },
          ].map(({ number, title, text, icon: Icon }) => <div className="step" key={number}><div className="step-top"><span>{number}</span><Icon size={26} strokeWidth={1.35} /></div><h3>{title}</h3><p>{text}</p></div>)}</div>
        </section>

        <section className="donate-section" id="donate" aria-labelledby="donate-title">
          <div className="section-shell"><div className="section-label"><span className="label-line" /> A LITTLE LESS FOR YOU. A LITTLE MORE FOR SOMEONE ELSE. <span className="section-number">02 / FOUR DRIVES</span></div><div className="section-heading-row"><h2 id="donate-title">Here’s what we did <br /><em>on those four drives.</em></h2><div className="section-intro"><span className="tiny-star"><Asterisk size={27} strokeWidth={1.2} /></span><p>Four neighborhoods. Four stories.<br />Tap a shirt to explore a drive.</p></div></div></div>
          <ClothingRail onDonate={openInquiry} onExplore={openDrive} />
          <div className="section-shell donation-options"><div className="food-note"><div className="can-illustration" aria-hidden="true"><span className="can-top" /><span className="can-label"><Sprout size={33} strokeWidth={1.4} /><span>A LITTLE<br />GOOD</span></span><span className="can-bottom" /></div><div><p className="eyebrow">MORE WAYS TO SHARE THE CARE.</p><h3>Everyday essentials.<br /><em>A little more care.</em></h3><p>We collect clothing, shelf-stable food, unopened hygiene products, and baby essentials from your doorstep. From your closet and pantry to everyday family essentials, a little extra can do a little good. Ask our team how to prepare your donation.</p><button className="text-link" onClick={openInquiry}>Give everyday essentials <ArrowUpRight size={17} /></button></div></div><div className="cash-note"><Heart size={26} strokeWidth={1.4} /><p className="eyebrow">ANOTHER WAY TO GIVE</p><h3>Care comes<br />in many forms.</h3><p>Prefer to make a cash donation? Connect with our team to learn how you can help.</p><button className="text-link" onClick={openInquiry}>Talk to our team <ArrowUpRight size={17} /></button></div></div>
        </section>

        <section className="destinations-section" aria-labelledby="destinations-title"><div className="section-shell destinations-grid"><div><p className="eyebrow"><span className="status-dot" /> THE GOOD GOES FURTHER</p><h2 id="destinations-title">From your doorstep.<br /><em>Into the community.</em></h2><p>A little generosity can go a long way. We collect donations for organizations caring for our wider community.</p><span className="destination-flower" aria-hidden="true"><Asterisk size={104} strokeWidth={1} /></span></div><div className="destination-list"><div><span className="destination-index">01</span><h3>Food Bank of<br />Contra Costa &amp; Solano</h3><PackageOpen size={28} strokeWidth={1.1} /></div><div><span className="destination-index">02</span><h3>St. Anthony’s<br />Foundation</h3><HeartHandshake size={28} strokeWidth={1.1} /></div><div><span className="destination-index">03</span><h3>Davis Street</h3><Sprout size={29} strokeWidth={1.1} /></div></div></div></section>

        <section className="team-section section-shell" id="our-team" aria-labelledby="team-title"><div className="section-label"><span className="label-line" /> LOCAL ROOTS. SHARED PURPOSE. <span className="section-number">03 / OUR PEOPLE</span></div><div className="section-heading-row"><h2 id="team-title">Big hearts.<br /><em>Right here at home.</em></h2><div className="section-intro team-intro"><span className="archive-chip">The 2025 team</span><p>The Dougherty Valley students<br />behind Share The Care.</p></div></div><div className="team-grid">{team.map(person => <article className="person" key={person.name}><div className="person-photo"><img src={`/images/${person.image}`} alt={person.name} loading="lazy" width="400" height="500" style={{ objectPosition: person.position, scale: person.zoom }} /><span className="person-year">CLASS OF ’{person.year.slice(-2)}</span></div><h3>{person.name}</h3><p>{person.role}</p></article>)}</div><div className="team-bottom"><span><MapPin size={14} /> DOUGHERTY VALLEY · SAN RAMON</span><a className="text-link" href="mailto:anishkoppula@gmail.com?subject=Getting%20involved%20with%20Share%20The%20Care">Want to get involved? Say hello <ArrowUpRight size={17} /></a></div></section>

        <PastDrives onExplore={openDrive} onDonate={openInquiry} />

        <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title"><div className="contact-top"><p className="eyebrow">FROM ONE NEIGHBOR TO ANOTHER</p><span className="local-time">SAN RAMON, CALIFORNIA <MapPin size={13} /></span></div><div className="contact-main"><h2 id="contact-title">A little care.<br /><em>A lot of possibility.</em></h2><button className="contact-circle" onClick={openInquiry} aria-label="Get in touch about donating"><ArrowUpRight size={46} strokeWidth={1.2} /><span>LET’S DO SOME GOOD</span></button></div><div className="contact-links"><a href="mailto:anishkoppula@gmail.com">anishkoppula@gmail.com <ArrowUpRight size={16} /></a><a href="tel:+16506806214">(650) 680-6214 <ArrowUpRight size={16} /></a><a href="https://www.instagram.com/sr_sharethecare/" target="_blank" rel="noreferrer">@sr_sharethecare <ArrowUpRight size={16} /></a></div></section>
      </main>
      <footer className="site-footer"><a className="footer-brand" href="#home"><HeartHandshake size={23} strokeWidth={1.5} /> share the care.</a><p>Made of neighbors. Moved by care.</p><span>© {new Date().getFullYear()} Share The Care</span><a className="back-top" href="#home">BACK TO TOP <ArrowRight size={14} /></a></footer>
      <DriveImpactDialog drive={activeDrive} onClose={() => setActiveDrive(null)} onReturnFocus={returnDriveFocus} />
      <PickupDialog open={inquiryOpen} onOpenChange={setInquiryOpen} onReturnFocus={returnInquiryFocus} />
    </div>
  );
}
