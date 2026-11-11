import { ArrowUpRight, Check, ChevronDown, MapPin } from 'lucide-react';
import { DriveMapCredit } from '@/components/drive-map-credit';
import { drives, type Drive } from '@/src/data';

export function PastDrives({ onExplore, onDonate }: { onExplore: (drive: Drive) => void; onDonate: () => void }) {
  return (
    <section className="drives-section" id="our-drives" aria-labelledby="drives-title">
      <div className="section-shell">
        <div className="section-label"><span className="label-line" /> ONE NEIGHBORHOOD AT A TIME <span className="section-number">04 / PAST DRIVES</span></div>
        <div className="section-heading-row"><h2 id="drives-title">Care has<br /><em>a local address.</em></h2><div className="section-intro"><span className="archive-chip">Four neighborhood drives</span><p>Four neighborhoods. One shared purpose.<br />Explore a route and the good we could do.</p></div></div>
        <div className="drives-grid">{drives.map(drive => (
          <article className="drive-card" key={drive.id}>
            <div className="drive-map"><img src={drive.mapSrc} alt={`Collection area for ${drive.community}`} width="960" height="600" loading="lazy" /><span className="map-chip"><MapPin size={13} /> SAN RAMON, CA</span><span className="drive-number">{drive.number}</span></div>
            <DriveMapCredit drive={drive} />
            <div className="drive-info">
              <div className="drive-meta"><span>DOORSTEP PICKUP</span><span>{drive.date}</span></div>
              <h3>{drive.community}</h3>
              <button className="text-link drive-story-link" onClick={() => onExplore(drive)} aria-label={`View impact for ${drive.community}`}>View impact <ArrowUpRight size={16} /></button>
              <details>
                <summary>Explore the route <ChevronDown size={17} /></summary>
                <div className="route-detail-map"><img src={drive.mapSrc} alt={`Route map for ${drive.community}`} loading="lazy" width="960" height="600" /></div>
                <DriveMapCredit drive={drive} />
                <ul>{drive.streets.map(street => <li key={street}><Check size={14} />{street}</li>)}</ul>
                <a className="map-full-link" href={drive.mapSrc} target="_blank" rel="noreferrer">View the full map <ArrowUpRight size={14} /></a>
              </details>
            </div>
          </article>
        ))}</div>
        <div className="next-drive"><div><span className="status-dot" /><span>Wondering when we’re in your neighborhood next?</span></div><button className="text-link" onClick={onDonate}>Ask about a pickup <ArrowUpRight size={18} /></button></div>
      </div>
    </section>
  );
}
