// The four use-case pages. All share one template; only this data changes.

export const solutions = [
  {
    id: 'drone',
    slug: 'drone-mapping',
    navLabel: 'Drone & UAV Mapping',
    seo: {
      title: 'RTK Base Station for Drone Mapping in India | Aerom',
      description:
        'Own your ground control. India-built RTK GNSS base and rover for drone surveying: PPK logging, RTCM3 corrections, RINEX and geotag export.',
      keyword: 'rtk base station for drone mapping',
      secondary: ['ppk drone survey india', 'gnss base station for drone', 'ground control points drone mapping', 'rtk gps for drone surveying'],
    },
    hero: {
      eyebrow: 'Drone & UAV mapping',
      h1: 'Ground control that costs less than your drone',
      sub: 'Set your own base, log raw observations, and post-process the flight yourself. No per-project PPK fees, no rented receiver, no waiting on a CORS station that does not cover your site.',
    },
    pains: [
      { h: 'Laying GCPs eats the day', p: 'Half a flying day spent walking targets across a site, and the accuracy still depends on how well you measured them.' },
      { h: 'Renting a base, every project', p: 'Rental and per-project PPK service fees quietly become one of your biggest line items on repeat work.' },
      { h: 'CORS coverage runs out', p: 'The moment you fly outside a covered city, network corrections stop being an option and you need your own base.' },
    ],
    workflow: [
      { h: 'Set the base', p: 'Over a known point, or averaged in fix. The base logs raw observations for the whole flight.' },
      { h: 'Fly', p: 'Corrections over NTRIP to your drone for RTK, or just log and go for PPK. Both work.' },
      { h: 'Post-process', p: 'Drop the flight log and the base log into Aerom Studio. Fix, float and single are labelled plainly.' },
      { h: 'Export', p: 'Geotagged image list, RINEX, or a corrected CSV — into Pix4D, Agisoft, WebODM or your own pipeline.' },
      { h: 'Check', p: 'A quality report you can hand to a client, showing what was fixed and what was not.' },
    ],
    features: [
      { h: 'RTCM3 corrections out', p: 'Feed any RTK-capable drone or third-party rover.' },
      { h: 'Raw logging for PPK', p: 'Full-rate raw observations for the whole session, no separate licence.' },
      { h: 'NTRIP caster + client', p: 'Use a network correction service, or be one for your own crew.' },
      { h: 'RINEX + geotag CSV export', p: 'Formats your photogrammetry software already reads.' },
      { h: 'Works away from coverage', p: 'A base you own works where no CORS station reaches.' },
      { h: 'One base, several rovers', p: 'Share corrections across a crew instead of buying receivers each.' },
    ],
    specs: [
      ['Receiver', 'u-blox GNSS receiver, all-band multi-constellation'],
      ['Demonstrated RTK', '~1 cm horizontal on our own hardware'],
      ['Corrections out', 'RTCM3 over NTRIP, serial or Wi-Fi'],
      ['Raw logging', 'For PPK post-processing in Aerom Studio'],
      ['Export', 'RINEX, geotag CSV, corrected point CSV'],
      ['Base setup', 'Known point or averaged-in fix, with ARP datum marker'],
    ],
    faq: [
      { q: 'Do I still need ground control points?', a: 'Fewer, and mostly as independent checks rather than as the thing your whole model is anchored to. With PPK or RTK the camera positions carry the geometry, so GCPs shift from being load-bearing to being verification. Most operators keep a handful of checkpoints and drop the rest.' },
      { q: 'Which drones does it work with?', a: 'Any drone that accepts RTCM3 corrections over NTRIP will work as an RTK rover. For PPK, Aerom logs raw observations independently, so it works alongside any drone that timestamps its images — the drone does not need to talk to us at all.' },
      { q: 'Can I use it without internet in the field?', a: 'Yes. That is the main reason to own a base. Set the base, log raw data, and post-process later. Network corrections are an option, not a requirement.' },
      { q: 'Is the accuracy good enough for photogrammetry?', a: 'RTK accuracy is comparable across the market — everyone lands around 7–8 mm + 1 ppm horizontal, and Aerom has demonstrated ~1 cm on its own hardware. In practice photogrammetric accuracy is limited by your flight plan, camera and overlap long before it is limited by the receiver.' },
    ],
  },

  {
    id: 'survey',
    slug: 'land-surveying',
    navLabel: 'Land Surveying',
    seo: {
      title: 'RTK GNSS Receiver for Land Surveying in India | Aerom',
      description:
        'Survey-grade RTK GNSS built in India for topo, cadastral, stakeout and control — with Indian coordinate systems and deliverable formats.',
      keyword: 'rtk gnss for land survey india',
      secondary: ['dgps survey instrument india', 'gnss rover and base india', 'cadastral survey gps', 'stakeout gnss receiver'],
    },
    hero: {
      eyebrow: 'Land surveying',
      h1: 'The accuracy class you need. Not the price tag you were quoted.',
      sub: 'Topo, boundary, control and stakeout — with the coordinate systems, datums and deliverable formats Indian work actually requires, and someone in your time zone when something goes wrong.',
    },
    pains: [
      { h: 'The quote was fifteen lakh', p: 'Imported premium receivers price out exactly the surveyors who would use them every day.' },
      { h: 'A bad fix nobody caught', p: 'Float mistaken for fix, an antenna height typed wrong — and the re-survey costs more than the instrument saved.' },
      { h: 'Software that fights you', p: 'Wrong datum, wrong projection, an export format the department rejects. The instrument was never the hard part.' },
    ],
    workflow: [
      { h: 'Set up', p: 'Base over a known point or on NTRIP corrections. Antenna height entered against a marked ARP datum, not guessed.' },
      { h: 'Collect', p: 'Point averaging, codes and attributes, photos against points. Fix state is shown in plain language, not a colour you have to remember.' },
      { h: 'Stake out', p: 'Navigate to design points with clear guidance in the field.' },
      { h: 'Export', p: 'Correct CRS and datum, in the format your deliverable actually needs.' },
    ],
    features: [
      { h: 'Indian CRS and datums', p: 'The projections and transformations Indian survey work runs on.' },
      { h: 'Honest fix reporting', p: 'FIX, FLOAT and SINGLE stated plainly, with correction age alongside.' },
      { h: 'Point averaging', p: 'Occupy and average, with the statistics recorded against the point.' },
      { h: 'Stakeout', p: 'Design points in, guidance out.' },
      { h: 'Audit metadata per point', p: 'Fix state, satellites, accuracy and antenna height stored with every observation.' },
      { h: 'Photos against points', p: 'Attach site photos to the point record for defensible evidence.' },
    ],
    specs: [
      ['Receiver', 'u-blox GNSS receiver, all-band multi-constellation'],
      ['Demonstrated RTK', '~1 cm horizontal, ~1 cm vertical on our own hardware'],
      ['Corrections', 'NTRIP client, own base, or RTCM3 in/out'],
      ['Pole', 'Telescoping, ARP datum marker at a known height'],
      ['Coordinate systems', 'Indian CRS, datums and export formats'],
      ['Tilt compensation', 'Not yet — on the roadmap'],
    ],
    faq: [
      { q: 'Is this accurate enough for cadastral and boundary work?', a: 'Aerom has demonstrated ~1 cm horizontal and vertical RTK on its own hardware, which is the same accuracy class as receivers costing considerably more — published RTK accuracy across the market sits around 7–8 mm + 1 ppm. What matters as much for boundary work is the record: fix state, satellite count, accuracy and antenna height are stored against every point so the observation is defensible later.' },
      { q: 'Does it have tilt compensation?', a: 'Not yet. It is on the roadmap and we would rather say so than let you find out after purchase. Today you level the pole, as surveyors did for decades. If tilt is essential to your workflow right now, Aerom is not the right instrument for you yet.' },
      { q: 'What corrections can I use?', a: 'Your own base station, a commercial NTRIP service, or a CORS network where one covers your area. Owning the base means you are not dependent on coverage or a subscription.' },
      { q: 'Can I export to the formats my department requires?', a: 'Indian deliverable formats are a core part of what we build, and it is the main thing we ask pilot users about. If your department needs a format we do not yet write, tell us — that feedback is the point of the pilot programme.' },
    ],
  },

  {
    id: 'construction',
    slug: 'construction',
    navLabel: 'Construction & Infrastructure',
    seo: {
      title: 'GNSS for Construction Layout & As-Built Surveys | Aerom',
      description:
        'Set out from design, capture as-builts and keep one base feeding a whole crew. India-built RTK GNSS for site layout, road and rail alignment and infrastructure work.',
      keyword: 'gnss for construction layout',
      secondary: ['rtk gps construction site india', 'as built survey gnss', 'setting out gnss receiver', 'road alignment survey gps'],
    },
    hero: {
      eyebrow: 'Construction & infrastructure',
      h1: 'Set out from the design. Capture what was actually built.',
      sub: 'One base on site feeding as many rovers as your crew needs, with layout and as-built capture that ends in a file your design team can open.',
    },
    pains: [
      { h: 'Layout errors are expensive', p: 'A setting-out mistake found at pour is orders of magnitude costlier than the survey that would have caught it.' },
      { h: 'As-builts drift from design', p: 'What was built and what was drawn diverge quietly, and nobody finds out until handover.' },
      { h: 'Paying a contractor per visit', p: 'Calling in a survey contractor for every check adds up faster than owning the instrument.' },
    ],
    workflow: [
      { h: 'Base on site', p: 'Set once, corrections available across the whole site for the day.' },
      { h: 'Stake out from design', p: 'Load design points and navigate to them.' },
      { h: 'Capture as-built', p: 'Record what exists, with codes and photos attached.' },
      { h: 'Back to the office', p: 'Export in the CRS your design set was drawn in.' },
    ],
    features: [
      { h: 'One base, many rovers', p: 'Corrections shared across the crew rather than a receiver each.' },
      { h: 'Stakeout from design points', p: 'Import the set, navigate, record the delta.' },
      { h: 'As-built capture with codes', p: 'Structured attributes, not a folder of loose points.' },
      { h: 'CAD-ready export', p: 'Formats your design team already works in.' },
      { h: 'Swappable battery', p: 'Change packs mid-shift instead of losing the afternoon to charging.' },
      { h: 'Direct support in India', p: 'Site is down, someone answers — same country, same working day.' },
    ],
    specs: [
      ['Receiver', 'u-blox GNSS receiver, all-band multi-constellation'],
      ['Demonstrated RTK', '~1 cm horizontal on our own hardware'],
      ['Base', 'Tripod-mounted, feeds multiple rovers over NTRIP'],
      ['Power', 'Swappable battery module, hot-swap in the field'],
      ['Rover', '2.0 m telescoping pole, ARP datum marker, flat phone mount'],
      ['Export', 'CAD-ready and standard survey formats'],
    ],
    faq: [
      { q: 'Can several rovers share one base?', a: 'Yes. The base broadcasts RTCM3 corrections over NTRIP, and any number of rovers on site can consume them. For a crew this is usually the difference between one receiver purchase and several.' },
      { q: 'How long does a battery last on site?', a: 'The battery module is swappable by design, so the practical answer is as long as you have packs. That was a deliberate choice over a bigger sealed battery — a dead receiver at 2pm is worse than carrying a spare.' },
      { q: 'Will it export into our CAD workflow?', a: 'Standard survey and CAD-ready exports are part of the software. Tell us which package your design team uses and we will confirm the specific format before you commit.' },
    ],
  },

  {
    id: 'government',
    slug: 'government-institutional',
    navLabel: 'Government & Institutional',
    seo: {
      title: 'Make-in-India RTK GNSS Receiver for Government Survey',
      description:
        'Indigenously built survey-grade RTK GNSS for government, municipal and institutional survey programmes. Domestic manufacture, direct support.',
      keyword: 'make in india gnss receiver',
      secondary: ['indigenous gnss receiver india', 'gem gnss survey equipment', 'svamitva survey equipment', 'navic rtk receiver'],
    },
    hero: {
      eyebrow: 'Government & institutional',
      h1: 'Built in India, for work that has to be',
      sub: 'Indian government drone and survey procurement increasingly requires indigenous components. Aerom is designed and built domestically, supported domestically, with NavIC on the roadmap.',
    },
    pains: [
      { h: 'Procurement rules narrow the field', p: 'Indigenous-component requirements in government and defence-adjacent procurement rule out much of what is on the market.' },
      { h: 'Budget per unit is fixed', p: 'A programme that needs fifty receivers cannot buy them at premium-import prices.' },
      { h: 'Training and standardising a large team', p: 'Fifty instruments across ten districts need identical setup, templates and deliverable formats — not fifty local conventions.' },
    ],
    workflow: [
      { h: 'Fleet provisioning', p: 'Identical configuration across every unit in the programme.' },
      { h: 'Standard project templates', p: 'The same CRS, codes and attributes on every device.' },
      { h: 'Capture', p: 'Field teams collect against a common standard.' },
      { h: 'Deliverables', p: 'Government-format outputs with an audit trail per point.' },
    ],
    features: [
      { h: 'Designed and built in India', p: 'Domestic manufacture, relevant where indigenous content is required.' },
      { h: 'Direct support and training', p: 'In-country, in your language, on your schedule.' },
      { h: 'NavIC on the roadmap', p: 'Aligned with national positioning infrastructure.' },
      { h: 'Fleet configuration', p: 'Provision many units to one standard.' },
      { h: 'Audit metadata per point', p: 'Fix state, satellites, accuracy and antenna height on every observation.' },
      { h: 'Government deliverable formats', p: 'Outputs shaped to what departments actually accept.' },
    ],
    specs: [
      ['Receiver', 'u-blox GNSS receiver, all-band multi-constellation'],
      ['Demonstrated RTK', '~1 cm horizontal, ~1 cm vertical on our own hardware'],
      ['Manufacture', 'Designed and assembled in India'],
      ['NavIC', 'On the roadmap'],
      ['Fleet', 'Provisioning and standard project templates'],
      ['Support', 'Direct, in India, with training'],
    ],
    faq: [
      { q: 'Is Aerom eligible for Make-in-India procurement?', a: 'Aerom is designed and assembled in India, which is the relevant condition in procurement rules that specify indigenous content. Eligibility for any particular tender depends on that tender\'s wording and on documentation we can prepare with you — ask us and we will go through the specific requirement rather than give you a blanket yes.' },
      { q: 'Are Chinese-origin receivers restricted in Indian government work?', a: 'Indian government procurement has tightened around foreign-origin components in drone and sensitive programmes, and precise positioning falls within that scope in several categories. It is not a blanket ban across all civilian use, and we would rather state the limit accurately than overstate it. Where a programme does require indigenous content, a domestically built receiver is the straightforward answer.' },
      { q: 'Can you support a fleet of fifty units across districts?', a: 'Fleet provisioning and standard project templates are built for exactly this. Practically, a programme of that size should start as a pilot in one or two districts so the workflow and deliverable formats are proven before it scales — that is what we would propose.' },
      { q: 'Do you support NavIC?', a: 'NavIC is on the roadmap, not shipping today. We list it as a roadmap item rather than a feature because it is not yet in your hands.' },
    ],
  },
];

export const bySlug = Object.fromEntries(solutions.map(s => [s.slug, s]));
export const byId = Object.fromEntries(solutions.map(s => [s.id, s]));
