import { esc } from '../templates/layout.mjs';
import { crumb, breadcrumbSchema } from '../templates/blocks.mjs';
import { site, legal } from '../data/site.mjs';

/**
 * Privacy policy and terms of use.
 *
 * DRAFTED, NOT LAWYERED. These are written against the Indian DPDP Act 2023 and
 * the DPDP Rules 2025 (full compliance expected by 13 May 2027), with GDPR-shaped
 * language for the European visitors the site is deliberately open to. They are a
 * solid, honest starting point — but a qualified lawyer should review them before
 * you rely on them, especially once you are taking money.
 *
 * Everything that must be filled in with real company details lives in
 * `legal` in src/data/site.mjs, not in this file.
 */

const wrapper = (title, updated, inner) => `
<section class="section section--tight"><div class="wrap" style="max-width:820px">
  <p class="eyebrow">Legal</p>
  <h1>${esc(title)}</h1>
  <p class="mono" style="color:var(--muted);font-size:var(--step--1);margin-top:16px">Last updated ${esc(updated)}</p>
</div></section>
<section class="section section--tight"><div class="wrap prose" style="max-width:820px">
${inner}
</div></section>`;

/* ============================== PRIVACY ============================== */
export function privacy() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Privacy', href: '/privacy/' }];

  const inner = `
<p class="lede">We ask for your details so that a person can reply to you about survey equipment. That is the whole purpose. This page sets out exactly what we collect, why, who else sees it, how long we keep it, and how you get it deleted.</p>

<h2>Who is responsible for your data</h2>
<p>${esc(legal.entity)} ("Dragonfly", "we", "us") is the Data Fiduciary under the Digital Personal Data Protection Act, 2023, and the Data Controller for the purposes of the UK and EU GDPR.</p>
<ul>
  <li><strong>Registered address:</strong> ${esc(legal.address)}</li>
  <li><strong>Contact for privacy questions:</strong> <a href="mailto:${esc(legal.privacyEmail)}">${esc(legal.privacyEmail)}</a></li>
  <li><strong>Grievance Officer / authorised representative:</strong> ${esc(legal.grievanceOfficer)}, <a href="mailto:${esc(legal.privacyEmail)}">${esc(legal.privacyEmail)}</a></li>
</ul>

<h2>What we collect</h2>
<h3>When you submit a form</h3>
<p>Only what you type, plus a little context about where you came from:</p>
<ul>
  <li>Name, and organisation if you give one</li>
  <li>Email address</li>
  <li>Phone or WhatsApp number, if you give one</li>
  <li>City or country, if you give one</li>
  <li>What you tell us you are trying to solve</li>
  <li>Which use case you selected</li>
  <li>The page you submitted from, the site that referred you, and any campaign parameters in the link you followed</li>
  <li>The date and time of submission</li>
</ul>
<p>Name and email are required because we cannot reply without them. Everything else is optional and the form works without it.</p>

<h3>When you simply browse</h3>
<p>We use <strong>Ahrefs Web Analytics</strong>, which is cookie-free and does not build a profile of you. It reports aggregate figures — pages viewed, country, referring site, device type — and does not store data that identifies you personally. <strong>We set no advertising cookies and no tracking cookies</strong>, which is why this site shows you no cookie banner. If we ever add a tool that needs cookies, we will ask you first.</p>
<p>Our hosting provider, Vercel, processes standard server request logs, including IP addresses, for the short period needed to serve the site securely and defend against abuse.</p>

<h2>Why we process it, and on what basis</h2>
<table class="cmp" style="min-width:0">
  <thead><tr><th scope="col">Purpose</th><th scope="col">Basis (DPDP Act)</th><th scope="col">Basis (GDPR)</th></tr></thead>
  <tbody>
    <tr><th scope="row">Replying to your enquiry, sending the price sheet, arranging a demonstration</th><td>Your consent, given when you submit the form</td><td>Art. 6(1)(b) steps prior to a contract, and Art. 6(1)(f) legitimate interest in responding to a business enquiry</td></tr>
    <tr><th scope="row">Following up about the pilot programme</th><td>Your consent</td><td>Art. 6(1)(f) legitimate interest</td></tr>
    <tr><th scope="row">Keeping the site secure and preventing form abuse</th><td>Legitimate use</td><td>Art. 6(1)(f) legitimate interest</td></tr>
    <tr><th scope="row">Understanding aggregate site usage</th><td>Not personal data — aggregate only</td><td>Not personal data — aggregate only</td></tr>
  </tbody>
</table>
<p><strong>We do not sell your data. We do not share it with advertisers. We do not add you to a marketing newsletter without asking.</strong> If we ever want to use your details for something other than the purpose above, we will ask for fresh consent.</p>

<h2>Who else processes it</h2>
<p>We use a small number of established service providers, each bound to process data only on our instructions:</p>
<ul>
  <li><strong>Google (Google Sheets)</strong> — stores enquiries. Servers may be outside India.</li>
  <li><strong>Apollo.io</strong> — our customer relationship system, so a follow-up does not get lost. Servers in the United States.</li>
  <li><strong>Resend</strong> — sends us the notification email that alerts us to your enquiry.</li>
  <li><strong>Vercel</strong> — hosts the website and runs the form endpoint.</li>
  <li><strong>Ahrefs</strong> — aggregate, cookie-free web analytics.</li>
</ul>
<p><strong>Cross-border transfer.</strong> Some of these providers store data outside India, and outside the European Economic Area. Where we transfer personal data internationally we rely on the providers' standard contractual clauses and equivalent safeguards. The DPDP Act permits transfer other than to countries the Central Government restricts; we will stop using any provider that becomes non-compliant.</p>

<h2>How long we keep it</h2>
<ul>
  <li><strong>Enquiries:</strong> up to 36 months from our last contact with you, then deleted. If you tell us you are not interested, we delete sooner.</li>
  <li><strong>Server logs:</strong> retained by our host for a short operational period only.</li>
  <li><strong>Analytics:</strong> aggregate only, never tied to you.</li>
</ul>
<p>If you ask us to delete your data, we delete it from the spreadsheet and from Apollo, and we confirm when it is done.</p>

<h2>Your rights</h2>
<p>Whoever and wherever you are, you can ask us to:</p>
<ul>
  <li><strong>Tell you what we hold</strong> about you and who we have shared it with</li>
  <li><strong>Correct or complete</strong> anything inaccurate</li>
  <li><strong>Erase</strong> your data</li>
  <li><strong>Withdraw your consent</strong> — as easily as you gave it, and with no consequence other than that we stop contacting you</li>
  <li><strong>Nominate</strong> another person to exercise these rights on your behalf if you die or become incapacitated (a right specific to the DPDP Act)</li>
  <li><strong>Object to, or restrict,</strong> processing, and receive your data in a portable form (rights under GDPR, which we extend to everyone)</li>
</ul>
<p>To exercise any of these, email <a href="mailto:${esc(legal.privacyEmail)}">${esc(legal.privacyEmail)}</a> with the word "privacy" in the subject. We respond within 30 days, usually far sooner because there are not many of us and it does not take long.</p>

<h2>If you are unhappy with our response</h2>
<p>Tell our Grievance Officer first, at <a href="mailto:${esc(legal.privacyEmail)}">${esc(legal.privacyEmail)}</a> — we would rather fix it ourselves. If that does not resolve it, you may complain to the <strong>Data Protection Board of India</strong>. If you are in the EEA or the UK, you may also complain to your local supervisory authority.</p>

<h2>Security</h2>
<p>The site is served only over HTTPS. Form submissions are sent to our own endpoint, validated server-side, rate-limited, and stored in access-controlled systems. Credentials are held as encrypted environment variables and never appear in the website's code. No system is perfectly secure, and we will not claim otherwise — but if a personal data breach occurs we will report it to the Data Protection Board within 72 hours of becoming aware, and tell affected individuals directly, as the DPDP Rules require.</p>

<h2>Children</h2>
<p>This site is intended for surveying and mapping professionals. It is not directed at children, and we do not knowingly collect data from anyone under 18. If you believe a child has submitted their details, tell us and we will delete them.</p>

<h2>Automated decisions</h2>
<p>We do not make automated decisions with legal or similarly significant effects about you. A person reads every enquiry.</p>

<h2>Changes</h2>
<p>If we change this policy we will update the date at the top. If a change is significant — a new purpose, a new category of data, a new recipient — we will tell anyone whose data we hold before it takes effect.</p>
`;

  return {
    url: '/privacy/',
    title: 'Privacy Policy | Dragonfly',
    description: 'What Dragonfly collects when you contact us about Aerom, why, who processes it, how long we keep it, and how to have it deleted. DPDP Act and GDPR aligned.',
    body: wrapper('Privacy policy', legal.updated, inner),
    schema: [breadcrumbSchema(trail)],
    bodyClass: 'is-legal',
  };
}

/* =============================== TERMS =============================== */
export function terms() {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Terms', href: '/terms/' }];

  const inner = `
<p class="lede">Plain terms for a website that gives information and takes enquiries. Nothing here sells you anything — a sale, if it happens, will be under a separate written agreement.</p>

<h2>1. Who runs this site</h2>
<p>${esc(site.domain.replace('https://', ''))} is operated by ${esc(legal.entity)}, ${esc(legal.address)}. Contact: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>

<h2>2. The site is information, not an offer</h2>
<p>Everything here is provided for general information. Nothing on this site is an offer to sell, a quotation, or a binding commitment. A purchase, a pilot placement or any supply of equipment will be governed by a separate written agreement between us.</p>

<h2>3. Product information is preliminary</h2>
<p>Aerom is in active development and is in a pilot programme. This matters, so we will be specific about it:</p>
<ul>
  <li><strong>Specifications are indicative</strong> and will change as the production build is finalised.</li>
  <li><strong>Accuracy figures described as "demonstrated"</strong> are results measured on our own hardware under good sky view. They are not a guaranteed performance specification, and they are not a warranty. Real-world GNSS accuracy depends on satellite geometry, atmospheric conditions, multipath, obstruction, antenna setup and correction quality — most of which are outside anyone's control.</li>
  <li><strong>Roadmap items are not features.</strong> Where we describe something as "on the roadmap" — including tilt compensation and NavIC support — it is not available today and we make no commitment as to when, or whether, it will be.</li>
  <li><strong>Environmental and ingress ratings are not certified</strong> and are not claimed.</li>
  <li><strong>Prices</strong> shared on request are indicative and valid only as stated in the document we send you.</li>
</ul>
<p>Do not rely on this site alone for a purchasing, engineering or regulatory decision. Ask us, and we will give you the current position in writing.</p>

<h2>4. Comparisons with other products</h2>
<p>We compare Aerom with products from Trimble, Leica Geosystems, Topcon, CHC Navigation, Hi-Target, South Surveying and Emlid. Those comparisons are made in good faith from manufacturers' published specifications and indicative market prices, verified on the date shown on the relevant page. Specifications and prices change, and ours may fall out of date between reviews.</p>
<p>All third-party product names and trademarks belong to their respective owners. They are used here only to identify those products for honest comparison. <strong>We are not affiliated with, endorsed by, sponsored by or otherwise connected to any of these companies.</strong></p>
<p>If you represent one of them and believe something on this site is inaccurate or unfair, email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> and we will review it promptly and correct it if you are right. An inaccurate comparison damages our credibility more than it damages yours.</p>

<h2>5. Our intellectual property</h2>
<p>The design, text, images, 3D models, code and other content of this site are owned by ${esc(legal.entity)} or used with permission. "Dragonfly" and "Aerom" are our marks. You may read, print and share pages for your own evaluation. You may not republish substantial parts of the site, or use our content or marks commercially, without our written permission.</p>

<h2>6. Acceptable use</h2>
<p>Please do not attempt to breach or probe the security of the site, submit false or other people's details through our forms, send automated or bulk submissions, scrape the site at a volume that degrades it for others, or use it for anything unlawful. We rate-limit and block abusive traffic.</p>

<h2>7. Third-party links</h2>
<p>Where we link to other sites we do so because they are useful. We do not control them and are not responsible for their content or their privacy practices.</p>

<h2>8. Availability and liability</h2>
<p>We aim to keep the site available and accurate but we do not guarantee either. To the fullest extent the law allows, we exclude liability for any indirect or consequential loss, and for any loss of profit, revenue, data or business, arising from your use of this site or reliance on its content. Nothing in these terms limits liability for fraud, for death or personal injury caused by negligence, or for anything else that cannot lawfully be limited.</p>

<h2>9. Privacy</h2>
<p>How we handle your personal data is set out in our <a href="/privacy/">privacy policy</a>, which forms part of these terms.</p>

<h2>10. Changes</h2>
<p>We may update these terms. The version published here is the current one, and the date at the top tells you when it changed.</p>

<h2>11. Governing law</h2>
<p>These terms are governed by the laws of India. The courts at ${esc(legal.jurisdiction)} have exclusive jurisdiction, except that if you are a consumer resident elsewhere, you keep the benefit of any mandatory protections of your home country's law.</p>
`;

  return {
    url: '/terms/',
    title: 'Terms of Use | Dragonfly',
    description: 'Terms of use for dragonflylab.in, including how to read our preliminary product specifications, accuracy claims and comparisons with other manufacturers.',
    body: wrapper('Terms of use', legal.updated, inner),
    schema: [breadcrumbSchema(trail)],
    bodyClass: 'is-legal',
  };
}
