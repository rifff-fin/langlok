/**
 * All marketing copy for the LANGLOK site lives here. Components never hard-code text.
 * LANGLOK (Langlok Int. Company Ltd.) is the company; VERSA is its premium water, sold in a
 * white can (500 ml) and a white aluminium bottle (990 ml). Name the company where the
 * company is meant (the logo, the mission, ReCan, custom branding) and VERSA for the water.
 * Sources: docs/LANGLOK_Website_Master_Plan.md §4.3, docs/client/mission.txt,
 * docs/client/story-behind-the-logo.txt, and the can/bottle labels.
 *
 * Headlines mark their accent with asterisks: 'Drink only what *the sky gives.*' sets the
 * plain part in light Jost and the accent in Bodoni Moda italic (components/ui/Emph.tsx).
 *
 * Rules: no invented statistics; no absolute health claims in new copy.
 * Anything awaiting client confirmation is marked TODO(client).
 */

export const site = {
  brand: 'LANGLOK',
  /** The company's premium water brand. */
  product: 'VERSA',
  company: 'Langlok Int. Company Ltd.',
  domain: 'langlok.com',
  tagline: 'Drink only what the sky gives.',
  description:
    'VERSA premium natural drinking water by LANGLOK, in aluminium cans and bottles, custom-branded for hotels, franchises, events and venues.',
  manufactured: 'VERSA is made in Panchagarh, Rangpur, Bangladesh by Langlok Int. Company Ltd.',
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
  homeLabel: 'LANGLOK home',
} as const;

/** The Motion switch (bottom-left corner): overrides the OS reduced-motion setting. */
export const motionSwitch = {
  label: 'Motion',
  on: 'On',
  off: 'Off',
  title: 'Turn scroll animation on or off',
} as const;

/** Per-route <title> and meta description. */
export const meta = {
  home: {
    title: 'VERSA by LANGLOK — Drink only what the sky gives.',
    description:
      'VERSA premium natural drinking water by LANGLOK, in aluminium cans and bottles, custom-branded for hotels, franchises, events and venues. Made in Panchagarh, Bangladesh.',
  },
  customBranding: {
    title: 'Custom-branded water — LANGLOK',
    description:
      'Put your logo on VERSA cans and bottles. Custom-branded aluminium water for hotels, franchises, events and venues.',
  },
  recan: {
    title: 'ReCan programme — LANGLOK',
    description:
      'Every can comes home. The closed-loop ReCan programme collects, recycles and returns value to our partners.',
  },
  story: {
    title: 'Chatak, the story behind the logo — LANGLOK',
    description:
      'The pied cuckoo that drinks only what the sky gives — the story behind the VERSA label.',
  },
  contact: {
    title: 'Contact — LANGLOK',
    description: 'Request samples or talk to the LANGLOK team at Langlok Int. Company Ltd.',
  },
  notFound: { title: 'Page not found — LANGLOK', description: '' },
} as const;

export const preloader = {
  label: 'Loading LANGLOK',
} as const;

/**
 * 01 Hero. The first screen is the can itself (intro); scrolling tips its lid towards the
 * camera and dives through the opening into "Sky to Seal", the scroll film, whose beats
 * are positioned as fractions of the hero's scroll.
 */
export const hero = {
  intro: {
    eyebrow: 'VERSA · Natural drinking water',
    title: 'Drink only what *the sky gives.*',
    sub: 'Every drop of VERSA begins as monsoon rain over the north of Bangladesh.',
    aside: '*A vessel for the rain.*',
    asideLines: ['Aluminium can · 500 ml', 'Aluminium bottle · 990 ml'],
    canAlt: 'The white VERSA 500 ml can, with the Chatak catching a raindrop',
  },
  dive: {
    eyebrow: '01 · The click',
    title: 'One small click. *The sky opens.*',
  },
  fogHint: 'Wipe the glass',
  scrollHint: 'Scroll',
  filmAlt:
    'Film: the Chatak waits on an acacia branch in a misty forest; monsoon clouds roll in, rain falls and he catches the first drop; the rain becomes a river in the mist.',
  /**
   * Captions over the film, one at a time, after the client's story of the Chatak
   * (docs/client/story-behind-the-logo.txt). Timing: film/timeline.ts.
   */
  captions: [
    {
      id: 'wait',
      label: '01 · The wait',
      title: 'He waited *for the sky.*',
      sub: 'Other birds drank from the pond and the river. Not the Chatak.',
    },
    {
      id: 'monsoon',
      label: '01 · The monsoon',
      title: 'The wind turned. *The clouds came.*',
      sub: 'Heavy clouds gathered over the fields.',
    },
    {
      id: 'flight',
      label: '01 · The flight',
      title: 'He flew *into the storm.*',
      sub: 'He opened his wings and flew straight up — not away from the storm, but into it.',
    },
    {
      id: 'drop',
      label: '01 · The first drop',
      title: 'Only what *the sky gives.*',
      sub: 'Beak open to the heavens, he caught the rain mid-air — cold, clean, falling.',
    },
    {
      id: 'river',
      label: '01 · The river',
      title: 'The rain *has returned.*',
      sub: 'Monsoon rain finds its way through forest and stone to the rivers of the north.',
    },
  ],
  /** Where the film ends and the can comes back (`at`: fraction of the hero's scroll). */
  vessel: {
    at: 0.9,
    label: '01 · The vessel',
    title: 'Meet VERSA.',
    sub: 'Sealed in aluminium. Never plastic.',
  },
} as const;

/** 03 Products */
export const products = {
  chapter: '03',
  eyebrow: 'The vessels',
  title: 'Two vessels. *Never plastic.*',
  specLabel: 'Specification',
  can: {
    name: 'VERSA Can',
    volume: '500 ml',
    callouts: [
      '500 ml',
      'Ø 66 mm · 168 mm tall',
      'Natural drinking water',
      'pH 7.0',
      'Infinitely recyclable aluminium',
    ],
    imageAlt: 'The white VERSA 500 ml can, with the Chatak catching a raindrop',
  },
  bottle: {
    name: 'VERSA Aluminium Bottle',
    volume: '990 ml',
    callouts: [
      '990 ml',
      'Ø 80 mm · 265 mm tall',
      'Resealable aluminium bottle',
      'Refill, reuse, repeat',
    ],
    imageAlt: 'The white VERSA 990 ml resealable aluminium bottle',
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
  title: 'Your name, *on our water.*',
  sub: 'Custom-branded cans and bottles for hotels, franchises, events and venues.',
  cta: { label: 'Try it with your logo →', href: '/custom-branding' },
  placeholder: 'YOUR LOGO HERE',
  canAlt: 'A white VERSA can with a YOUR LOGO HERE label',
  bottleAlt: 'A white VERSA bottle with a YOUR LOGO HERE label',
} as const;

/** 05 Configurator */
export const configurator = {
  chapter: '05',
  eyebrow: 'Configurator',
  title: 'See it *on the can.*',
  intro:
    'Upload your logo and see it on a VERSA can or bottle. When it looks right, request a quote — we’ll prepare print-ready artwork with you.',
  previewAlt: {
    can: 'A VERSA can wearing your design',
    bottle: 'A VERSA bottle wearing your design',
  },
  /** Mobile only: the controls sit in tabs under the preview. */
  groups: { logo: 'Logo', vessel: 'Vessel', colour: 'Colour', size: 'Size' },
  groupsLabel: 'Configurator settings',
  brandNameLabel: 'Brand name',
  brandNamePlaceholder: 'Your brand',
  font: {
    label: 'Lettering',
    options: { sans: 'Modern', serif: 'Classic' },
  },
  customHexLabel: 'Custom colour (hex)',
  customPickerLabel: 'Pick a custom colour',
  upload: {
    label: 'Upload your logo',
    hint: 'PNG, SVG or JPG, up to 5 MB',
    drop: 'Drop it here',
    orType: 'or type your brand name',
    current: 'On the label:',
    replace: 'Replace',
    remove: 'Remove',
    reading: 'Reading your logo…',
    keyed: 'We took out its white background for the preview.',
    usingLogo: 'The label shows your uploaded logo. Remove it to use the brand name instead.',
    errors: {
      type: 'Please upload a PNG, SVG or JPG file.',
      size: 'That file is larger than 5 MB.',
      read: 'We couldn’t read that file. Please try another one.',
      dimensions: 'That image is too large to preview. Please use one under 8,000 pixels across.',
    },
  },
  vessel: {
    label: 'Vessel',
    options: { can: 'Can 500 ml', bottle: 'Bottle 990 ml', both: 'Both' },
  },
  background: {
    label: 'Label background',
    options: { white: 'White', silver: 'Silver', navy: 'Navy', custom: 'Custom' },
  },
  logoSize: 'Logo size',
  logoPosition: 'Logo position',
  rotateHint: 'Drag to rotate · double-click to reset',
  rotateHintTouch: 'Swipe sideways to turn · double-tap to reset',
  /** The preview is a slider for keyboards and screen readers: it turns the vessel. */
  rotate: {
    label: 'Turn the preview',
    keys: 'Left and right arrow keys turn the vessel, up and down tilt it, plus and minus change the logo size, and 0 faces it forward again.',
    front: 'Facing front',
    left: 'Turned {deg}° left',
    right: 'Turned {deg}° right',
  },
  flatNote: 'A flat view of your label (this browser can’t show the 3D preview).',
  savePreview: 'Save preview',
  saving: 'Saving…',
  saved: 'Preview saved as a PNG.',
  previewFile: 'langlok-preview.png',
  requestQuote: 'Request a quote',
  reset: 'Start over',
} as const;

/**
 * 06 Chatak story — the client's story of the logo (docs/client/story-behind-the-logo.txt)
 * in about a hundred words (asked for on 19 Oct 2026), its quote set in the headline voice.
 */
export const story = {
  chapter: '06',
  eyebrow: 'The story behind the logo',
  titleBengali: 'চাতক',
  title: 'Chatak',
  species: { common: 'Pied cuckoo', latin: 'Clamator jacobinus' },
  readMore: { label: 'Read the story →', href: '/story' },
  /**
   * Checked against the record (17 Oct 2026): the pied or Jacobin cuckoo is a summer visitor
   * to Bangladesh, called chatak (চাতক) in Bengali; in Sanskrit poetry the chātaka waits
   * for rain to quench its thirst (Kalidasa, Meghaduta); farmers have long taken its arrival
   * as the sign of the monsoon and the sowing season (Wildlife Institute of India). That it
   * drinks only rain is folklore, so the copy tells it as a story, not a fact.
   */
  text: [
    'In Bengali folklore, the Chatak drinks only rain. All summer he waited on a dry acacia branch while other birds drank from the pond and the river.',
    // TODO(client): the original says "the fields of Umm Lajj" (Saudi Arabia). The plan
    // suggests Tetulia, Panchagarh. Using Tetulia until the client confirms.
    'They thought he was proud. He was just faithful. Then the monsoon wind turned, clouds gathered over Tetulia, and the first drop fell. He flew up into the storm and caught it mid-air, and the farmer below smiled: when the Chatak drinks, the rain has truly returned.',
  ],
  quote: '“The rain will come. *I drink only what the sky gives.*”',
  closing: 'That is why he is on our logo, and on every can and bottle of VERSA.',
  /** The drawn film beside the story (film/StoryReel.tsx), in five moments. */
  reel: {
    alt: 'A short drawn film: the Chatak waits on an acacia branch in the misty woods, monsoon clouds roll in, he flies up into the storm and catches the first drop, and the rain falls on into a river in the mist.',
    label: 'Moments of the film',
    play: 'Play the film',
    pause: 'Pause the film',
    moments: {
      wait: 'The wait',
      monsoon: 'The monsoon',
      flight: 'The flight',
      drop: 'The first drop',
      river: 'The river',
    },
  },
} as const;

/** 07 Mission */
export const mission = {
  chapter: '07',
  eyebrow: 'Our mission',
  statement: 'Premium shouldn’t *cost the planet.*',
  paragraphs: [
    'At LANGLOK, we believe hydration should be both premium and sustainable. Founded by a team passionate about innovation and the planet, we’ve redefined what it means to drink responsibly. LANGLOK provides custom-branded canned water and reusable aluminium bottles for hotels, food franchises, events, and venues worldwide. Each product is designed to replace single-use plastic and deliver a cleaner, smarter, and more stylish drinking experience.',
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
  title: 'Every can *comes home.*',
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
  title: 'A vessel that never becomes *plastic waste.*',
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
  title: 'Made for places that *host people.*',
  segments: [
    { id: 'hotel', title: 'Hotels', line: 'In-room water that carries your name.' },
    { id: 'franchise', title: 'Food franchises', line: 'A branded can on every tray.' },
    { id: 'event', title: 'Events', line: 'Plastic-free hydration for every guest.' },
    { id: 'venue', title: 'Venues', line: 'Stadiums, halls and clubs, sealed in aluminium.' },
  ],
} as const;

/** 11 CTA + footer */
/**
 * 11 Leadership. A quiet look at who leads the company: roles only, no names (the client's
 * wish). Portraits from the client, prepared in scripts/build-portraits.py.
 */
export const leadership = {
  chapter: '11',
  eyebrow: 'Leadership',
  title: 'The people *behind the water.*',
  sub: 'Langlok Int. Company Ltd. works from offices in Dhaka and Riyadh, and makes VERSA at its own factory in Panchagarh.',
  company: 'Langlok Int. Company Ltd.',
  people: [
    {
      id: 'ceo',
      // TODO(client): sent as "Akm Jobaed Nahid" (19 Oct 2026); confirm how he writes the
      // initials (AKM, A.K.M. or A K M).
      name: 'AKM Jobaed Nahid',
      role: 'Chief Executive Officer',
      image: '/img/people/ceo.webp',
      alt: 'Portrait of AKM Jobaed Nahid',
    },
    {
      id: 'md',
      name: 'S M Khairul Islam',
      role: 'Managing Director',
      image: '/img/people/managing-director.webp',
      alt: 'Portrait of S M Khairul Islam',
    },
  ],
} as const;

export const cta = {
  title: 'Bring VERSA *to your venue.*',
  primary: { label: 'Request samples', href: '/contact' },
  secondary: { label: 'Talk to us', href: '/contact' },
} as const;

export const footer = {
  missionLine: 'Premium natural drinking water in aluminium, made to replace single-use plastic.',
  officesHeading: 'Offices',
  whatsapp: 'WhatsApp',
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
  title: 'Talk *to us.*',
  intro:
    'Tell us about your hotel, franchise, event or venue. We’ll reply with samples, pricing and a branding proposal.',
  addressHeading: 'Langlok Int. Company Ltd.',
  /** The client's offices (19 Oct 2026). TODO(client): street addresses and a sales email. */
  offices: [
    {
      id: 'dhaka',
      label: 'Bangladesh office',
      city: 'Dhaka',
      lines: ['Uttara, Dhaka', 'Bangladesh'],
      phone: { display: '+880 1712-726628', href: 'tel:+8801712726628' },
      whatsapp: 'https://wa.me/8801712726628',
    },
    {
      id: 'riyadh',
      label: 'Saudi Arabia office',
      city: 'Riyadh',
      lines: ['Al Olaya, Riyadh', 'Saudi Arabia'],
      // given as +966 0505834757: the 0 is dropped after the country code
      phone: { display: '+966 50 583 4757', href: 'tel:+966505834757' },
      whatsapp: null,
    },
  ],
  factory: { label: 'Factory', lines: ['Panchagarh, Rangpur', 'Bangladesh'] },
  phoneLabel: 'Phone',
  whatsappLabel: 'WhatsApp Business',
  emailLabel: 'Email',
  email: null as string | null, // TODO(client): sales email
} as const;

/**
 * Inquiry form (contact, samples, branding, ReCan). Validated with the zod schema in
 * lib/inquiry.ts (fields match master plan §8.2); sending arrives with the API in Phase 6.
 */
export const inquiryForm = {
  heading: 'Send an inquiry',
  quoteHeading: 'Request a quote',
  design: {
    heading: 'Your design',
    logo: 'Logo',
    brandName: 'Brand name',
    vessel: 'Vessel',
    preview: 'Preview',
    previewAlt: 'Your saved preview of the vessel wearing your design',
    note: 'We’ll attach these to your inquiry.',
    edit: 'Change the design',
  },
  errors: {
    required: 'Please fill this in.',
    email: 'Please enter a valid email address.',
    consent: 'Please tick this box so we can reply.',
    tooLong: 'That’s a little long. Please shorten it.',
  },
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
  title: 'This drop *went astray.*',
  body: 'The page you were looking for isn’t here.',
  back: { label: 'Back to LANGLOK', href: '/' },
} as const;

/**
 * The client's original label and story text, kept verbatim for reference (the label
 * artwork still prints the earlier VERSA name).
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
    'Through our closed-loop ReCan programme, every can is collected, recycled, and reborn, benefitting clients financially by transforming waste into value and turning the cost of waste management into a new revenue stream. LANGLOK makes sustainability seamless, empowering businesses to showcase their values and reduce plastic waste without compromising luxury, convenience, or brand identity.',
} as const;

/** /dev route — Phase 0 pin test */
export const dev = {
  title: 'Pin test',
  intro: 'Scroll down. The panel below should pin for two screens while the bar fills.',
  pinned: 'Pinned with Lenis + ScrollTrigger',
  after: 'Unpinned. If that felt smooth on desktop and touch, Phase 0 is done.',
} as const;
