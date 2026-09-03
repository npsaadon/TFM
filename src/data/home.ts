/**
 * Homepage content.
 *
 * Copy is transcribed from the live WordPress site. Four deviations, all
 * deliberate and all marked with a NOTE comment below.
 */

import aboutImage from '@assets/images/36f503_eefb0fcb73ca4e8785b8f34608f6f05bmv2.avif';
import qualityImage from '@assets/images/front-view-young-attractive-lady-blue-construction-suit-helmet-controlling-machines-hangar-working-daytime-buildings-architecture-construction_140725-16225.jpg';
import innovationImage from '@assets/images/AdobeStock_1283076759-min.jpeg';
import serviceImage from '@assets/images/aerial-view-car.jpg';
import differenceBg from '@assets/images/cristina-gallego-pq96KN515wI-unsplash.jpg';
import heroImage from '@assets/images/AdobeStock_1048860360-min.jpeg';
/* The flag murals painted on the facility wall — sharp at 2560px and the
   right closing note for a made-in-USA manufacturer. */
import ctaBg from '@assets/images/AdobeStock_301275283-min-scaled.jpeg';
import cutaway from '@assets/images/AdobeStock_101138329-min.jpeg';

import cert1 from '@assets/images/centi_PNG.avif';
import cert2 from '@assets/images/centi-2_PNG.avif';
import cert3 from '@assets/images/centi-3_PNG.avif';
import cert4 from '@assets/images/centi-4_PNG.avif';
import cert5 from '@assets/images/centi-5_PNG.avif';
import cert6 from '@assets/images/centi-6_PNG.avif';

export const hero = {
  /* `<em>` marks the word rendered in brand red — the site's signature device. */
  headlineHtml: 'Leaders in foam and mattress innovations <em>worldwide</em>',
  cta: { label: 'Get Started', href: '/contact/' },
  /**
   * NOTE: the live site's hero slideshow uses image.png (1082px) and
   * image-1.png (854px) stretched across a 1920px+ viewport — the first thing
   * a visitor sees is a 2x upscale. This 5824px photograph of the facility
   * with the flag out front was sitting at the BOTTOM of the same page under
   * an 82% overlay. The sharp photo now leads; the soft aerials moved to the
   * closing band, where a heavy overlay hides their resolution.
   */
  image: heroImage,
  imageAlt:
    'The TFM manufacturing facility in Lansdale, Pennsylvania, with the American flag flying out front',
} as const;

export const intro = {
  eyebrow: 'What we do',
  lineOne: "We're not just a provider.",
  lineTwoHtml: "We're a <em>business</em> partner.",
  subhead: 'Proudly Manufactured in the USA. Dependable. Scalable. Built for Your Business.',
} as const;

/**
 * NOTE: these three counters exist in the live site's HTML but never render —
 * the Elementor counter script fails, so all three permanently display "0".
 * The values below are the real `data-to-value` attributes recovered from the
 * live markup. Worth confirming they are still accurate before launch.
 */
export const stats = [
  { value: 5.5, suffix: 'K+', label: 'Employees' },
  { value: 1.7, suffix: 'M', label: 'sq/ft combined facility space' },
  { value: 14, suffix: 'K', label: 'mattress production capacity per day' },
] as const;

/**
 * NOTE: the live site renders these three as emoji (🇺🇸 🏪 🛒) because
 * Elementor fails to load the SVGs. The correct icons were already sitting
 * unused in the WordPress media library; they are used properly here.
 *
 * On the live site each card is wrapped in an anchor whose href is "#" — it
 * looks clickable and goes nowhere. Each card here links to the page that
 * actually covers its subject.
 */
export const features = [
  {
    icon: 'usa',
    title: '100% U.S.-Based Manufacturing',
    body: 'All products are made in our American facility — ensuring quality, consistency, and quicker turnaround times.',
    href: '/about/#made-in-usa',
    linkLabel: 'About our facility',
  },
  {
    icon: 'warehouse',
    title: 'Warehousing Solutions',
    body: 'We can store your products and manage inventory right from our factory.',
    href: '/about/#capabilities',
    linkLabel: 'See our capabilities',
  },
  {
    icon: 'shipping',
    title: 'Drop Shipping Services',
    body: 'Seamless fulfillment directly to your customers — fast, efficient, and hassle-free.',
    href: '/private-label/#experience',
    linkLabel: 'How fulfillment works',
  },
] as const;

export const about = {
  eyebrow: 'About Us',
  headlineHtml: 'We make the most comfortable, advanced, and sought-after <em>mattresses.</em>',
  body: 'TFM USA is a highly experienced and reputable foam mattress maker specializing in a wide range of mattress types. We offer world-class private label solutions with experience supplying some of the leading mattress brands in the world.',
  /* NOTE: the live site reads "Over years of precision solutions." — the number
     is missing entirely. Private Label copy says "five decades," so 50 is the
     near-certain intent, but this needs confirming before launch. */
  checklist: [
    'Over 50 years of precision solutions.',
    'Engineered for durability and performance.',
    'Count on long-lasting, high-quality materials.',
    'Smart insulation, real results.',
  ],
  callLabel: 'Call us anytime',
  cta: { label: 'Read More', href: '/about/' },
  image: aboutImage,
  imageAlt: 'A TFM foam mattress with a teal-trimmed cover, styled in a bright modern bedroom',
} as const;

export const privateLabelBanner = {
  image: cutaway,
  imageAlt: 'Cutaway of a TFM mattress showing the quilted cover over three laminated foam layers',
  headline: 'Get the private label mattresses you need to succeed.',
  body: "Looking for a professional-grade mattress to sell under your brand? You're in the right place! TFM has been a trusted private label mattress manufacturer for some of the top mattress brands in the world. We've helped countless mattress companies build successful organizations by providing comfortable, innovative, and high-quality mattresses time and time again. With our private label mattress solutions, you'll have everything you need to succeed.",
  cta: { label: 'Private Label', href: '/private-label/' },
} as const;

export const difference = {
  eyebrow: 'Why Choose Us',
  headlineHtml: 'The <em>TFM</em> Difference',
  background: differenceBg,
  /* Each card links to the page that expands on it, with an explicit
     "learn more" affordance — a card that merely looks clickable is a broken
     promise to the visitor. */
  cards: [
    {
      title: 'Quality',
      body: 'As a leading private label foam mattress distributor, we have a proven track record of developing some of the highest quality mattresses in the industry. Our quality is trusted by some of the most well-known and far-reaching mattress brands in the entire world. Our manufacturing is done using the finest raw chemicals and materials utilizing the latest state of the art machinery on the market.',
      image: qualityImage,
      imageAlt: 'A TFM technician in a hard hat operating production machinery on the factory floor',
      href: '/about/',
      linkLabel: 'More about TFM',
    },
    {
      title: 'Innovation',
      body: "You don't maintain a position as a leader in the mattress industry without constant improvement and advancement. Ever since we first opened up shop, we've been at the forefront of innovation. Our mattress technology, designs, and manufacturing solutions continue to push the entire market forward.",
      image: innovationImage,
      imageAlt: 'A large roll of finished foam wrapped for shipping inside the plant',
      href: '/private-label/#product-development',
      linkLabel: 'Product development',
    },
    {
      title: 'A-To-Z Service',
      body: 'We offer a broad range of premium mattress types and can personalize anything to your unique specifications including custom branding to bring your mattress products to life. The TFM team will go a step further by providing full-service shipping and logistics solutions for a hassle-free experience, handling everything from design and production to fulfillment.',
      image: serviceImage,
      imageAlt: 'Aerial view of a container port with cargo ships and stacked freight containers',
      href: '/private-label/',
      linkLabel: 'Private label services',
    },
  ],
} as const;

/**
 * NOTE: every badge on the live site carries alt text like "centi_PNG" — the
 * raw filename, which tells a screen-reader user nothing. Each is described
 * properly here, read off the artwork itself.
 */
export const certifications = {
  eyebrow: 'Independently verified',
  headlineHtml: '3rd Party Accreditations <em>&amp;</em> Certifications',
  note: 'Materials, safety, and quality standards audited by independent bodies — not claims we grade ourselves on.',
  badges: [
    { src: cert1, alt: 'CertiPUR — the PU-foam SHE standard, Europur AISBL' },
    { src: cert2, alt: 'CertiPUR-US — contains certified flexible polyurethane foam' },
    { src: cert3, alt: 'Certification International — ISO 9001:2008, certificate CIP/3080/01/10/281' },
    { src: cert4, alt: "Reader's Digest Trusted Brand 2015, Platinum award, Philippines" },
    { src: cert5, alt: 'Trusted by the Philippine Orthopaedic Association, Inc., incorporated 1972' },
    { src: cert6, alt: 'Proud member of ISPA, the International Sleep Products Association' },
  ],
} as const;

export const finalCta = {
  eyebrow: 'Get In Touch',
  headlineHtml: 'Ready to <em>Upgrade</em> Your Foam Solutions?',
  body: "At TFM, we specialize in delivering custom insulation and foam products that meet the demands of today's most challenging industrial environments — from automotive to aerospace. Whether you're developing a new product or improving an existing one, our team is here to support you every step of the way with expert guidance, premium materials, and fast turnaround times. Let's talk about how we can help bring your next project to life.",
  cta: { label: 'Get Started', href: '/contact/' },
  background: ctaBg,
  backgroundAlt: '',
} as const;
