export const team = [
  { name: 'Anish Koppula', role: 'Co-founder / President', year: '2027', image: 'anish-koppula-new.webp', position: 'center 8%' },
  { name: 'Brian Ayabe', role: 'Co-founder / President', year: '2027', image: 'brian-ayabe.jpg', position: 'center 25%' },
  { name: 'Rahul Gopalasetty', role: 'Vice President', year: '2027', image: 'rahul-gopalasetty.png', position: 'center', zoom: 1.7 },
  { name: 'Shivam Pande', role: 'Vice President', year: '2027', image: 'shivam-pande.jpg', position: 'center 18%' },
];

export type Drive = {
  id: string; community: string; date: string; streets: string[]; mapSrc: string;
  mapCredit?: string; number: string; garment: number; summary: string;
  clothing: number; cans: number; packagedFood: number; households: number;
  clothingDetails: string; foodDetails: string;
  story: { title: string; description: string }[];
};

const esriCredit = 'Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, © OpenStreetMap contributors, and the GIS User Community';

// All results and activities are fictional examples requested for the trial website.
// The first two dates/routes are from the original site; the other events/routes are examples.
export const drives: Drive[] = [
  {
    id: 'quail-run', community: 'Quail Run', date: 'June 24, 2025',
    streets: ['Cinnamon Ridge Road', 'W Branch Road', 'Cornflower Street'],
    mapSrc: '/images/quail-run-map.png', mapCredit: esriCredit, number: '01', garment: 0,
    summary: 'A morning of doorstep pickups turned extra clothes and pantry staples into a little more care for our community.',
    households: 24, clothing: 146, cans: 88, packagedFood: 42,
    clothingDetails: 'T-shirts, hoodies, jeans, and jackets, sorted by size and type.',
    foodDetails: 'Canned vegetables and beans, plus unopened rice, pasta, and cereal.',
    story: [
      { title: 'A neighborhood showed up.', description: 'Twenty-four households left labeled bags at their doorsteps. Our volunteers worked along Cinnamon Ridge Road, W Branch Road, and Cornflower Street.' },
      { title: 'Every bag got a little care.', description: 'The team separated clothing from food, organized garments by size, and checked that packaged pantry items were sealed and within their dates.' },
      { title: 'The good kept going.', description: 'We packed the clothing for a community clothing program and boxed the canned and packaged food for a local pantry donation.' },
    ],
  },
  {
    id: 'the-bridges', community: 'The Bridges', date: 'June 24, 2025',
    streets: ['Velvetleaf Circle', 'Galeridge Court', 'Mediar Drive'],
    mapSrc: '/images/bridges-map.png', mapCredit: esriCredit, number: '02', garment: 1,
    summary: 'Neighbors made room in their closets and pantries. A few walking routes brought all that generosity together.',
    households: 19, clothing: 112, cans: 76, packagedFood: 38,
    clothingDetails: 'Everyday shirts, sweaters, children’s clothing, and light jackets.',
    foodDetails: 'Canned soup, fruit, and vegetables, alongside sealed oatmeal, crackers, and pasta.',
    story: [
      { title: 'The route started at home.', description: 'Nineteen families prepared donations across Velvetleaf Circle, Galeridge Court, and Mediar Drive. Volunteers collected each bag during the morning route.' },
      { title: 'Small things added up.', description: 'Back at our sorting point, we counted the donations, grouped clothing into sizes, and boxed food by type.' },
      { title: 'Ready for their next chapter.', description: 'The clothing was prepared for redistribution through a community program, and the shelf-stable food was packed for a local pantry.' },
    ],
  },
  {
    id: 'gale-ranch', community: 'Gale Ranch', date: 'July 12, 2025',
    streets: ['Bollinger Canyon Road', 'Dougherty Road', 'North Wedgewood Road'],
    mapSrc: '/images/gale-ranch-map.png', mapCredit: esriCredit, number: '03', garment: 2,
    summary: 'A summer closet clear-out became a neighborhood effort, with clothing, canned goods, and sealed pantry food shared from doorstep to doorstep.',
    households: 31, clothing: 184, cans: 124, packagedFood: 62,
    clothingDetails: 'Summer T-shirts, trousers, children’s clothes, and a few warm layers.',
    foodDetails: 'Canned beans and vegetables, sealed rice, dry lentils, cereal, and boxed pasta.',
    story: [
      { title: 'A summer clear-out, shared.', description: 'Thirty-one households joined the route around Gale Ranch. Volunteers paired up to collect bags and keep clothing separate from food.' },
      { title: 'One very full sorting table.', description: 'Our team sorted 184 garments and checked 186 canned and packaged food items before grouping them into labeled boxes.' },
      { title: 'A little extra became useful again.', description: 'The finished clothing bundles and pantry boxes were prepared for donation to local community programs.' },
    ],
  },
  {
    id: 'windemere', community: 'Windemere', date: 'August 2, 2025',
    streets: ['Windemere Parkway', 'East Branch Parkway', 'Albion Road'],
    mapSrc: '/images/windemere-map.png', mapCredit: esriCredit, number: '04', garment: 3,
    summary: 'One last summer drive brought neighbors together to pass on clothes and share the pantry extras their families wouldn’t use.',
    households: 28, clothing: 168, cans: 102, packagedFood: 54,
    clothingDetails: 'Hoodies, everyday shirts, jeans, and children’s clothing ready for another season.',
    foodDetails: 'Canned soup and beans, unopened cereal, rice, pasta, and packaged snacks.',
    story: [
      { title: 'Good at every doorstep.', description: 'Twenty-eight households took part in the Windemere collection. Volunteers walked the neighborhood and brought donations back to a shared sorting point.' },
      { title: 'Sorted with the next person in mind.', description: 'We separated 168 clothing items by size and packed 156 canned and packaged food items into sturdy, labeled boxes.' },
      { title: 'A community effort, passed along.', description: 'Clothing bundles went toward a local redistribution program, while shelf-stable pantry donations were prepared for community food support.' },
    ],
  },
];
