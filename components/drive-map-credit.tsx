import type { Drive } from '@/src/data';

export function DriveMapCredit({ drive }: { drive: Drive }) {
  if (!drive.mapCredit) return null;
  return <p className="map-credit" title={drive.mapCredit}>Map: <a href="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer" target="_blank" rel="noreferrer">Esri &amp; contributors</a></p>;
}
