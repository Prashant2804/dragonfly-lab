// Global site configuration. One place for anything that appears on every page.

export const site = {
  domain: 'https://dragonflylab.in',
  company: 'Dragonfly',
  legalName: 'Dragonfly Labs',
  product: 'Aerom',
  tagline: 'Survey-grade RTK GNSS, built in India.',
  email: 'prashantkr2804@gmail.com',   // TODO: swap for hello@dragonflylab.in once mail is set up
  phone: '',                            // TODO: add a number you want published
  city: 'New Delhi, India',
  // Ahrefs Web Analytics — free, privacy-friendly, no cookie banner needed.
  ahrefsKey: 'U/EWzwBm5PuoiBjbyB25zQ',
  // Set these when you have them; the build skips the tags if empty.
  ga4Id: '',
  clarityId: '',
  founded: 2026,
};

/**
 * Legal identity. THESE MUST BE REAL BEFORE LAUNCH — the privacy policy and
 * terms of use are legally weaker if the entity behind them is vague, and the
 * DPDP Rules require a published contact who can answer data questions.
 *
 * TODO(prashant): replace the four placeholders below with the registered
 * entity name, its registered address, the person who will act as Grievance
 * Officer, and a working privacy@ address.
 */
export const legal = {
  entity: 'Dragonfly Labs',                     // TODO: exact registered name, e.g. "Dragonfly Labs Private Limited"
  address: 'New Delhi, India',                  // TODO: full registered address
  grievanceOfficer: 'Prashant Kumar, Founder',  // TODO: confirm who holds this role
  privacyEmail: 'prashantkr2804@gmail.com',     // TODO: privacy@dragonflylab.in once mail is set up
  jurisdiction: 'New Delhi',
  updated: '20 August 2026',
};

export const nav = [
  { label: 'Product',   href: '/product/' },
  {
    label: 'Solutions', href: '/solutions/',
    children: [
      { label: 'Drone & UAV Mapping',        href: '/solutions/drone-mapping/',            blurb: 'Base station + PPK for photogrammetry' },
      { label: 'Land Surveying',             href: '/solutions/land-surveying/',           blurb: 'Topo, cadastral, stakeout, control' },
      { label: 'Construction & Infrastructure', href: '/solutions/construction/',          blurb: 'Site layout, as-built, alignment' },
      { label: 'Government & Institutional', href: '/solutions/government-institutional/', blurb: 'Make-in-India procurement, research' },
    ],
  },
  { label: 'Software', href: '/software/' },
  { label: 'Compare',  href: '/compare/' },
  { label: 'Pricing',  href: '/pricing/' },
  { label: 'Company',  href: '/company/' },
];

// The one place the use-case list is defined — the form dropdown, the routing
// tiles and the nav all read from this so they can never drift apart.
export const useCases = [
  { id: 'drone',        label: 'I fly drones / do UAV mapping', short: 'Drone & UAV mapping',        href: '/solutions/drone-mapping/' },
  { id: 'survey',       label: 'I survey land',                 short: 'Land surveying',             href: '/solutions/land-surveying/' },
  { id: 'construction', label: 'I build infrastructure',        short: 'Construction & infra',       href: '/solutions/construction/' },
  { id: 'government',   label: 'Government / institutional buyer', short: 'Government & institutional', href: '/solutions/government-institutional/' },
  { id: 'other',        label: 'Something else',                short: 'Other',                      href: '/demo/' },
];

// Verified measurement from our own hardware. Do not inflate these.
export const proof = {
  hrms: '0.010 m',
  vrms: '0.010 m',
  sats: 12,
  carrier: 'FIXED',
  q: 4,
  correctionAge: '1.0 s',
  pointsLogged: 53,
  perPoint: '±14 mm',
  note: 'Measured on Aerom hardware in New Delhi. A demonstrated result under good sky view — not a published all-conditions specification.',
};
