/**
 * Buying, support and logistics.
 *
 * A procurement buyer replacing a dealer relationship asks four questions before
 * they ask about accuracy: what's in the box, how long until I get it, what
 * happens when it breaks, and who trains my crew. The site answered none of them
 * until now, which is a bigger conversion leak than any missing feature.
 *
 * ⚠️ TODO(prashant): every value below is a CONSERVATIVE PLACEHOLDER written so
 * the page is honest about a pilot-stage company. They are commitments to
 * customers. Confirm or change each one before launch — do not ship a warranty
 * term you have not decided to honour.
 */

export const commerce = {
  // TODO: confirm. 12 months is the floor for survey equipment in India;
  // Emlid offers 12, the premium brands 12-24.
  warrantyMonths: 12,

  // TODO: confirm against your actual build capacity.
  leadTime: '4–6 weeks from order during the pilot programme',

  // TODO: confirm. This is the number that decides against a dealer.
  serviceTurnaround: 'Target 5 working days in-workshop, plus transit',

  supportHours: 'Monday to Saturday, 9am–7pm IST',
  supportChannels: 'Phone, WhatsApp and email — to us, not to a dealer',

  training: 'Included: a live onboarding session for your crew, plus written and video guides in English and Hindi',

  boxRover: [
    'Aerom rover — receiver, gateway and antenna assembly',
    'Telescoping survey pole with marked ARP datum',
    'Swappable battery module',
    'Charger and cable set',
    'Flat phone cradle',
    'Transport case',
    'Calibration and antenna-offset record for your specific unit',
  ],
  boxBase: [
    'Aerom base station — receiver, gateway and ground-plane antenna',
    'Survey tripod with levelling tribrach',
    'Swappable battery module',
    'Charger and cable set',
    'Transport case',
    'Calibration and antenna-offset record for your specific unit',
  ],

  // The honest answers to the objections a dealer-served buyer will raise.
  faqs: [
    {
      q: 'What happens if it breaks on site?',
      a: 'You call or WhatsApp us directly — there is no dealer in between, which is the point. Support runs Monday to Saturday, 9am to 7pm IST. If the unit has to come in, we target five working days in the workshop plus transit. During the pilot programme we will also talk to you about a loan unit so a fault does not stop your job; ask us and we will tell you honestly what we can cover at your location.',
    },
    {
      q: 'What warranty do you offer?',
      a: 'Twelve months against manufacturing defects from the date of delivery, covering the receiver, gateway, antenna and battery module. Physical damage, water ingress beyond the rated conditions and unauthorised opening are not covered. Full terms come with the quotation — read them before you buy, from us or from anyone.',
    },
    {
      q: 'How long from order to delivery?',
      a: 'Four to six weeks during the pilot programme. We would rather quote a real date and hit it than quote two weeks and disappoint you. If you have a project deadline, tell us the date when you enquire and we will tell you straight away whether we can meet it.',
    },
    {
      q: 'Who trains my crew?',
      a: 'We do, directly. A live onboarding session for your team is included, plus written and video guides in English and Hindi. For institutional deployments we run a longer session and help you set standard project templates so every crew works to the same configuration.',
    },
    {
      q: 'What if I already use another brand\'s workflow?',
      a: 'Aerom exports the standard formats — RINEX, CSV, and the CAD and government deliverable formats — so it drops into an existing office workflow rather than replacing it. If your deliverable needs a format we do not yet write, tell us during the pilot; that feedback is exactly what the programme is for.',
    },
    {
      q: 'Can I see one before I commit?',
      a: 'Yes, and you should. We would rather you handled a unit and ran it against a control point you already know the answer to than took our word for anything on this website.',
    },
  ],
};
