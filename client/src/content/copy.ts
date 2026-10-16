/**
 * All marketing copy for the VERSA site lives here. Components never hard-code text.
 * Sources: docs/VERSA_Website_Master_Plan.md §4.3, docs/client/mission.txt,
 * docs/client/story-behind-the-logo.txt, and the can/bottle labels.
 *
 * Rules: no invented statistics; no absolute health claims in new copy.
 * Anything awaiting client confirmation is marked TODO(client).
 */

export const site = {
  brand: 'VERSA',
  company: 'Langlok Int. Company Ltd.',
  domain: 'langlok.com', // TODO(client): confirm VERSA is the site brand and langlok.com the domain
  tagline: 'Drink only what the sky gives.',
  description:
    'VERSA natural drinking water in aluminium cans and bottles, custom-branded for hotels, franchises, events and venues.',
  manufactured: 'Manufactured in Panchagarh, Bangladesh by Langlok Int. Company Ltd.',
  location: 'Panchagarh, Bangladesh',
} as const;

export const nav = {
  skipLink: 'Skip to main content',
  items: [
    { label: 'Products', href: '/#products' },
    { label: 'Your brand', href: '/custom-branding' },
    { label: 'ReCan', href: '/recan' },
    { label: 'The Chatak', href: '/story' },
    { label: 'Contact', href: '/contact' },
  ],
  cta: { label: 'Request samples', href: '/contact' },
  primaryLabel: 'Main',
  menuOpen: 'Menu',
  menuClose: 'Close',
  homeLabel: 'VERSA home',
} as const;

/** Per-route <title> and meta description. */
export const meta = {
  home: {
    title: 'VERSA — Drink only what the sky gives.',
    description:
      'VERSA natural drinking water in aluminium cans and bottles, custom-branded for hotels, franchises, events and venues. Made in Panchagarh, Bangladesh.',
  },
  customBranding: {
    title: 'Custom-branded water — VERSA',
    description:
      'Put your logo on VERSA cans and bottles. Custom-branded aluminium water for hotels, franchises, events and venues.',
  },
  recan: {
    title: 'ReCan programme — VERSA',
    description:
      'Every can comes home. The closed-loop ReCan programme collects, recycles and returns value to our partners.',
  },
  story: {
    title: 'Chatak, the story behind the logo — VERSA',
    description:
      'The pied cuckoo that drinks only what the sky gives — the story behind the VERSA logo.',
  },
  contact: {
    title: 'Contact — VERSA',
    description: 'Request samples or talk to the VERSA team at Langlok Int. Company Ltd.',
  },
  notFound: { title: 'Page not found — VERSA', description: '' },
} as const;

export const preloader = {
  label: 'Loading VERSA',
} as const;

/** 01 Hero — "Sky to Seal". Beats are positioned as fractions of the pinned scroll. */
export const hero = {
  fogHint: 'Wipe the glass',
  scrollHint: 'Scroll',
  filmAlt:
    'Film: monsoon clouds over the tea gardens of Tetulia, rain falling through earth and stone, a bright filtration hall, and a silver can rising out of mist.',
  beats: [
    {
      id: 'A',
      at: 0.0,
      title: 'Drink only what the sky gives.',
      sub: 'Every drop of VERSA begins as monsoon rain over the north of Bangladesh.',
    },
    { id: 'B', at: 0.15, title: 'The rain returns.', sub: 'Like the Chatak, we wait for it.' },
    { id: 'C', at: 0.35, title: 'Filtered by earth and time.', sub: null },
    { id: 'D', at: 0.55, title: 'Purified with care.', sub: 'Natural drinking water, pH 7.0.' },
    { id: 'E', at: 0.75, title: 'Sealed in aluminium. Never plastic.', sub: null },
    { id: 'F', at: 0.9, title: 'Meet VERSA.', sub: null },
  ],
  /** Chapter label shown above each beat (editorial numbering). */
  beatLabels: {
    A: '01 · Sky',
    B: '01 · Rain',
    C: '01 · Earth',
    D: '01 · Purify',
    E: '01 · Seal',
    F: '01 · Vessel',
  },
} as const;

/** 03 Products */
export const products = {
  chapter: '03',
  eyebrow: 'The vessels',
  title: 'Two vessels. Never plastic.',
  specLabel: 'Specification',
  can: {
    name: 'VERSA Can',
    volume: '500 ml',
    callouts: ['500 ml', 'Natural drinking water', 'pH 7.0', 'Infinitely recyclable aluminium'],
    imageAlt: 'VERSA 500 ml aluminium can with the Chatak catching a raindrop',
  },
  bottle: {
    name: 'VERSA Aluminium Bottle',
    volume: '990 ml',
    callouts: ['990 ml', 'Resealable aluminium bottle', 'Refill, reuse, repeat'],
    imageAlt: 'VERSA 990 ml resealable aluminium bottle',
  },
  labelLines: {
    front: ['Say no plastic', 'Save the world'],
    product: 'Natural drinking water',
    ph: 'pH 7.0',
  },
} as const;

/** 04 Your Logo Here */
export const yourLogo = {
  chapter: '04',
  eyebrow: 'Custom branding',
  title: 'Your name, on our water.',
  sub: 'Custom-branded cans and bottles for hotels, franchises, events and venues.',
  cta: { label: 'Try it with your logo →', href: '/custom-branding' },
  placeholder: 'YOUR LOGO HERE',
} as const;

/** 05 Configurator */
export const configurator = {
  chapter: '05',
  eyebrow: 'Configurator',
  title: 'See it on the can.',
  intro:
    'Upload your logo and see it on a VERSA can or bottle. When it looks right, request a quote — we’ll prepare print-ready artwork with you.',
  previewAlt: 'Preview of a VERSA can with your logo',
  brandNameLabel: 'Brand name',
  brandNamePlaceholder: 'Your brand',
  customHexLabel: 'Custom colour (hex)',
  upload: {
    label: 'Upload your logo',
    hint: 'PNG, SVG or JPG, up to 5 MB',
    orType: 'or type your brand name',
    errors: {
      type: 'Please upload a PNG, SVG or JPG file.',
      size: 'That file is larger than 5 MB.',
    },
  },
  vessel: {
    label: 'Vessel',
    options: { can: 'Can 500 ml', bottle: 'Bottle 990 ml', both: 'Both' },
  },
  background: {
    label: 'Label background',
    options: { silver: 'Silver', white: 'White', navy: 'Navy', custom: 'Custom' },
  },
  logoSize: 'Logo size',
  logoPosition: 'Logo position',
  rotateHint: 'Drag to rotate · double-click to reset',
  savePreview: 'Save preview',
  requestQuote: 'Request a quote',
} as const;

/** 06 Chatak story — the client's text, split into five chapters. */
export const story = {
  chapter: '06',
  eyebrow: 'The story behind the logo',
  titleBengali: 'চাতক',
  title: 'Chatak',
  species: { common: 'Pied cuckoo', latin: 'Clamator jacobinus' },
  readMore: { label: 'Read the story →', href: '/story' },
  birdAlt: 'The Chatak, a black-and-white crested pied cuckoo, perched on an acacia branch',
  catchAlt: 'The Chatak with its beak open, catching a single raindrop',
  chapters: [
    {
      id: 1,
      heading: 'He waited.',
      body: ['The Pied Cuckoo — the Jacobin cuckoo — was called Chatak.', 'All summer, he waited.'],
    },
    {
      id: 2,
      heading: 'Others drank from the pond.',
      body: [
        'Other birds drank from the pond, from puddles, from the river. Not Chatak. He sat on the dry acacia branch, his black and white crest raised, his throat parched, refusing.',
        '“The rain will come,” he told the sparrows. “I will drink only what the sky gives me directly.”',
      ],
    },
    {
      id: 3,
      heading: 'They thought he was proud. He was just faithful.',
      body: [],
    },
    {
      id: 4,
      heading: 'The monsoon wind turned.',
      body: [
        // TODO(client): the original says "the fields of Umm Lajj" (Saudi Arabia). The plan
        // suggests Tetulia, Panchagarh. Using Tetulia until the client confirms.
        'Then the monsoon wind turned. Clouds bruised purple over the fields of Tetulia. The first drop fell.',
      ],
    },
    {
      id: 5,
      heading: 'He flew into the storm.',
      body: [
        'Chatak opened his wings and flew straight up, not away from the storm but into it. Beak open to the heavens, he caught the raindrops mid-air — cold, clean, falling.',
        'He drank, and the farmer below smiled, for when Chatak drinks, the earth knows rain has truly returned.',
      ],
    },
  ],
} as const;

/** 07 Mission */
export const mission = {
  chapter: '07',
  eyebrow: 'Our mission',
  statement: 'Premium shouldn’t cost the planet.',
  paragraphs: [
    'At VERSA, we believe hydration should be both premium and sustainable. Founded by a team passionate about innovation and the planet, we’ve redefined what it means to drink responsibly. VERSA provides custom-branded canned water and reusable aluminium bottles for hotels, food franchises, events, and venues worldwide. Each product is designed to replace single-use plastic and deliver a cleaner, smarter, and more stylish drinking experience.',
    'We manage every stage — from design and production to delivery, storage, and recycling — so our partners can focus on what they do best.',
  ],
  stages: [
    { id: 'design', title: 'Design', line: 'Your brand on our label, prepared by our designers.' },
    {
      id: 'production',
      title: 'Production',
      line: 'Filled and sealed in aluminium in Panchagarh.',
    },
    { id: 'delivery', title: 'Delivery', line: 'Brought to your hotel, outlet, event or venue.' },
    { id: 'storage', title: 'Storage', line: 'We hold stock so you never run dry.' },
    { id: 'recycling', title: 'Recycling', line: 'Every empty can collected through ReCan.' },
  ], // TODO(client): confirm each stage line describes the actual service
  closing: 'You focus on your guests. We handle the rest.',
} as const;

/** 08 ReCan loop */
export const recan = {
  chapter: '08',
  eyebrow: 'ReCan programme',
  title: 'Every can comes home.',
  sub: 'Through our closed-loop ReCan programme, every can is collected, recycled, and reborn — turning the cost of waste management into a new revenue stream for our partners.',
  steps: ['Serve', 'Collect', 'Recycle', 'Reborn'],
  loopLabel: 'The ReCan loop: serve, collect, recycle, reborn, and back to serve.',
  pageIntro:
    'We manage collection and recycling for our partners, so the cans you serve come back as value instead of waste.',
  cta: { label: 'Become a ReCan partner', href: '/recan' },
  // TODO(client): how collection works, who pays whom, real figures. Counters stay hidden
  // until /api/stats returns non-zero values.
  stats: [
    { id: 'cansCollected', label: 'Cans collected' },
    { id: 'partners', label: 'ReCan partners' },
  ],
} as const;

/** 09 Why aluminium — careful, verifiable claims only. Each needs a footnoted source. */
export const whyAluminium = {
  chapter: '09',
  eyebrow: 'Why aluminium',
  title: 'A vessel that never becomes plastic waste.',
  cards: [
    {
      title: 'Infinitely recyclable',
      body: 'Aluminium can be recycled again and again without losing quality.',
      source: null, // TODO(client): add source (e.g. industry recycling body) before launch
    },
    {
      title: 'Light and strong',
      body: 'Light to carry, tough to dent, and quick to chill.',
      source: null, // TODO(client): add source
    },
    {
      title: 'No plastic bottle',
      body: 'The bottle body is aluminium, not plastic, so it replaces a single-use plastic bottle.',
      source: null, // TODO(client): confirm can/bottle lining type (e.g. BPA-NI) before any purity claim
    },
  ],
} as const;

/** 10 Who we serve */
export const whoWeServe = {
  chapter: '10',
  eyebrow: 'Who we serve',
  title: 'Made for places that host people.',
  segments: [
    { id: 'hotel', title: 'Hotels', line: 'In-room water that carries your name.' },
    { id: 'franchise', title: 'Food franchises', line: 'A branded can on every tray.' },
    { id: 'event', title: 'Events', line: 'Plastic-free hydration for every guest.' },
    { id: 'venue', title: 'Venues', line: 'Stadiums, halls and clubs, sealed in aluminium.' },
  ],
} as const;

/** 11 CTA + footer */
export const cta = {
  title: 'Bring VERSA to your venue.',
  primary: { label: 'Request samples', href: '/contact' },
  secondary: { label: 'Talk to us', href: '/contact' },
} as const;

export const footer = {
  missionLine: 'Premium natural drinking water in aluminium, made to replace single-use plastic.',
  exploreHeading: 'Explore',
  followHeading: 'Follow',
  // TODO(client): real social URLs (Twitter icon on the label should become X)
  social: [
    { label: 'Facebook', href: '#' },
    { label: 'X', href: '#' },
    { label: 'Instagram', href: '#' },
  ],
  legal: `© ${new Date().getFullYear()} Langlok Int. Company Ltd.`,
} as const;

/** /contact page */
export const contact = {
  eyebrow: 'Contact',
  title: 'Talk to us.',
  intro:
    'Tell us about your hotel, franchise, event or venue. We’ll reply with samples, pricing and a branding proposal.',
  addressHeading: 'Langlok Int. Company Ltd.',
  address: ['Panchagarh', 'Bangladesh'], // TODO(client): full street address, phone, sales email
  emailLabel: 'Email',
  email: null as string | null, // TODO(client): sales email
} as const;

/**
 * Inquiry form (contact, samples, branding, ReCan). Static in Phase 1;
 * zod schema + API wiring in Phases 4 and 6 (fields match master plan §8.2).
 */
export const inquiryForm = {
  heading: 'Send an inquiry',
  fields: {
    name: 'Name',
    company: 'Company',
    email: 'Email',
    phone: 'Phone (optional)',
    country: 'Country',
    businessType: 'Business type',
    product: 'Product',
    quantityEstimate: 'Estimated quantity (optional)',
    quantityPlaceholder: 'e.g. 5,000–20,000 per month',
    message: 'Message (optional)',
    consent: 'I agree to be contacted about this inquiry.',
  },
  businessTypes: {
    hotel: 'Hotel',
    franchise: 'Food franchise',
    event: 'Event',
    venue: 'Venue',
    other: 'Other',
  },
  products: { can500: 'Can 500 ml', bottle990: 'Bottle 990 ml', both: 'Both' },
  submit: 'Send inquiry',
  pendingNote: 'The form goes live soon. Until then, please contact us directly.', // TODO(client): remove in Phase 6
  recanHeading: 'Become a ReCan partner',
} as const;

export const notFound = {
  eyebrow: '404',
  title: 'This drop went astray.',
  body: 'The page you were looking for isn’t here.',
  back: { label: 'Back to VERSA', href: '/' },
} as const;

/**
 * The client's original label and story text, kept verbatim for reference.
 * Do not use `labelBack` on the site as-is: it contains absolute health claims
 * ("leaches nothing", "zero microplastics") that need the lining confirmed first.
 */
export const clientOriginal = {
  labelBack: {
    // TODO(client): flagged — absolute health claims; confirm lining type before using.
    headline: 'Cans are an infinitely recyclable alternative to plastic bottles',
    body: 'Every plastic bottle sheds thousands of invisible microplastics into your water, food, blood and organs, disrupting hormones and health while choking oceans. Aluminum locks purity in, leaches nothing, and recycles infinitely without loss. VERSA can means zero microplastics, healthier you, cleaner planet.',
    signoff: 'This CAN makes a difference.',
  },
  missionRecan:
    'Through our closed-loop ReCan programme, every can is collected, recycled, and reborn, benefitting clients financially by transforming waste into value and turning the cost of waste management into a new revenue stream. VERSA makes sustainability seamless, empowering businesses to showcase their values and reduce plastic waste without compromising luxury, convenience, or brand identity.',
} as const;

/** /dev route — Phase 0 pin test */
export const dev = {
  title: 'Pin test',
  intro: 'Scroll down. The panel below should pin for two screens while the bar fills.',
  pinned: 'Pinned with Lenis + ScrollTrigger',
  after: 'Unpinned. If that felt smooth on desktop and touch, Phase 0 is done.',
} as const;
