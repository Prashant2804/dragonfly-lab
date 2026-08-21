/**
 * SINGLE SOURCE OF TRUTH for every competitor claim on the site.
 *
 * Rules, because this table is a credibility instrument:
 *  1. Never claim better accuracy than the incumbents. Everyone lands around
 *     7-8 mm + 1 ppm horizontal. We win on price, fit and support — not mm.
 *  2. Keep at least one row where we visibly lose. Right now that is tilt
 *     compensation. A table where we win everything reads as marketing.
 *  3. Re-verify EVERY figure before each launch and quarterly after. Bump
 *     `verifiedOn` when you do. Stale competitor data discredits the whole page.
 *  4. Prices are indicative Indian street prices, not quotes.
 */

export const verifiedOn = 'August 2026';

export const competitors = {
  premium: {
    key: 'premium',
    name: 'Trimble / Leica',
    tier: 'Premium incumbent',
    price: '₹15–25 L',
    horizontal: '~8 mm + 1 ppm',
    builtInIndia: false,
    support: 'Via dealer',
    navic: 'Partial',
    tilt: true,
    indiaWorkflow: 'Generic',
    software: 'Paid, high',
    weakness: 'Priced for the few',
  },
  chinese: {
    key: 'chinese',
    name: 'CHC / Hi-Target',
    tier: 'Volume leader',
    price: '₹3–8 L',
    horizontal: '~8 mm + 1 ppm',
    builtInIndia: false,
    support: 'Via dealer',
    navic: 'Partial',
    tilt: true,
    indiaWorkflow: 'Weak',
    software: 'Bundled',
    weakness: 'Procurement & security curbs in government work',
  },
  emlid: {
    key: 'emlid',
    name: 'Emlid Reach RS4',
    tier: 'Disruptor',
    price: '~₹2 L',
    horizontal: '~7 mm + 1 ppm',
    builtInIndia: false,
    support: 'Email, EU hours',
    navic: 'No',
    tilt: true,
    indiaWorkflow: 'Generic',
    software: '~₹21k / yr',
    weakness: 'Not built for Indian workflows or support',
  },
  aerom: {
    key: 'aerom',
    name: 'Aerom',
    tier: 'Us',
    price: 'On request',
    horizontal: '~1 cm demonstrated',
    builtInIndia: true,
    support: 'Direct, in India',
    navic: 'On the roadmap',
    tilt: false,                    // the honest gap — do not flip this until it ships
    indiaWorkflow: 'Built for it',
    software: 'Bundled + Pro tier',
    weakness: 'Early — still validating in the field',
  },
};

export const compareRows = [
  { key: 'horizontal',    label: 'Horizontal RTK accuracy', note: 'Everyone is in the same place here.' },
  { key: 'price',         label: 'Indicative India price' },
  { key: 'builtInIndia',  label: 'Built in India', type: 'bool' },
  { key: 'support',       label: 'Support' },
  { key: 'navic',         label: 'NavIC' },
  { key: 'indiaWorkflow', label: 'Indian survey workflows' },
  { key: 'tilt',          label: 'Tilt compensation', type: 'bool' },
  { key: 'software',      label: 'Software subscription' },
];

export const defaultOrder = ['premium', 'chinese', 'emlid', 'aerom'];

/** Per-use-case competitor sets, so each solution page compares like for like. */
export const compareSets = {
  drone:        ['premium', 'chinese', 'emlid', 'aerom'],
  survey:       ['premium', 'chinese', 'emlid', 'aerom'],
  construction: ['premium', 'chinese', 'emlid', 'aerom'],
  government:   ['premium', 'chinese', 'emlid', 'aerom'],
};
