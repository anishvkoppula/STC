'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { ArrowDown, ArrowUpRight, Asterisk, MapPin } from 'lucide-react';

export type ParallaxComponentProps = { onDonate?: () => void; imageSrc?: string };

/** Adapted from the supplied four-layer pattern; owns only its own animation lifecycle. */
export function ParallaxComponent({ onDonate, imageSrc = '/images/san-ramon.webp' }: ParallaxComponentProps) {
  const parallaxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    let disposeSmoothScroll: (() => void) | undefined;

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const root = parallaxRef.current;
      const trigger = root?.querySelector('[data-parallax-layers]');
      if (!root || !trigger) return;
      const context = gsap.context(() => {
        const timeline = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true } });
        [{ layer: '1', yPercent: 55 }, { layer: '2', yPercent: 35 }, { layer: '3', yPercent: 22 }, { layer: '4', yPercent: 10 }].forEach(({ layer, yPercent }) => {
          timeline.to(trigger.querySelectorAll(`[data-parallax-layer="${layer}"]`), { yPercent, ease: 'none' }, 0);
        });
        gsap.fromTo(root.querySelectorAll('[data-hero-reveal]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .12, ease: 'power3.out', clearProps: 'opacity,visibility,transform' });
      }, root);

      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const updateScroll = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', updateScroll);
      gsap.ticker.add(tick);
      const anchorClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const hash = anchor?.getAttribute('href');
        if (!hash || hash.length < 2) return;
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        event.preventDefault();
        if (anchor?.classList.contains('skip-link')) target.focus({ preventScroll: true });
        lenis.scrollTo(target, { offset: -94 });
        history.replaceState(null, '', hash);
      };
      document.addEventListener('click', anchorClick);
      const dispose = () => {
        context.revert();
        gsap.ticker.remove(tick);
        lenis.off('scroll', updateScroll);
        lenis.destroy();
        document.removeEventListener('click', anchorClick);
      };
      disposeSmoothScroll = dispose;
      return () => { dispose(); disposeSmoothScroll = undefined; };
    });
    return () => { media.revert(); disposeSmoothScroll?.(); };
  }, []);

  return (
    <section className="parallax hero" ref={parallaxRef} aria-labelledby="hero-title">
      <div data-parallax-layers className="parallax__layers">
        <img src={imageSrc} width="2936" height="1642" fetchPriority="high" data-parallax-layer="1" alt="Golden evening light over the neighborhoods and green hills of San Ramon" className="parallax__layer-img" />
        <div data-parallax-layer="2" className="hero-shade" />
        <div data-parallax-layer="3" className="hero-content">
          <p className="hero-eyebrow" data-hero-reveal><span /> A LITTLE CARE. A STRONGER COMMUNITY.</p>
          <h1 id="hero-title" data-hero-reveal>Good starts<br /><em>close to home.</em></h1>
          <p className="hero-description" data-hero-reveal>Your extra can be someone’s enough. We bring<br className="desktop-break" /> San Ramon neighbors together through<br className="desktop-break" /> doorstep donation pickups.</p>
          <div className="hero-buttons" data-hero-reveal><button className="button button-lime" onClick={onDonate}>Ask about a pickup <ArrowUpRight size={19} /></button><a className="hero-text-link" href="#donate">See what you can give <ArrowDown size={16} /></a></div>
        </div>
        <div data-parallax-layer="4" className="hero-aside" aria-hidden="true"><Asterisk size={47} strokeWidth={1.2} /><p>A little less in your closet.<br />A little more good in the world.</p></div>
      </div>
      <div className="hero-bottom"><span><MapPin size={14} /> ROOTED IN SAN RAMON, CA</span><a href="#our-story" aria-label="Scroll to our story"><ArrowDown size={18} /><span>THE GOOD GOES ON</span></a></div>
      <span className="hero-photo-note">OUR NEIGHBORHOOD. OUR REASON.</span>
    </section>
  );
}
