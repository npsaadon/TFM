/** Private Label page content, transcribed from the live site. */

import headerImage from '@assets/images/slaapwijsheid-nl-K-7OB-Ubquo-unsplash.jpg';
import introImage from '@assets/images/AdobeStock_373028590-min.jpeg';
import developImage from '@assets/images/AdobeStock_495629400-min.jpeg';
import experienceImage from '@assets/images/AdobeStock_415008019-min.jpeg';
import whySewing from '@assets/images/AdobeStock_393234310-min-scaled.jpeg';
import whyMachinery from '@assets/images/heavy-machinery-units-high.jpg';
import whyWorker from '@assets/images/closeup-factory-worker-white-lab-suit-bla-.jpg';

export const meta = {
  title: 'Private Label',
  description:
    'Sell world-class foam mattresses under your own brand. TFM handles design, R&D, manufacturing, custom branding, shipping, and distribution end to end.',
} as const;

export const pageHeader = {
  title: 'Private Label',
  breadcrumb: 'Private Label',
  image: headerImage,
} as const;

/**
 * Alternating image/text blocks. `flip` swaps the image to the right so the
 * sequence zig-zags down the page.
 *
 * NOTE: the live site's third button reads "Start Desiging" — corrected to
 * "Designing" here.
 */
export const blocks = [
  {
    id: 'private-label',
    title: 'Private Label',
    body: "Get professional-quality mattress products without having to worry about designing, manufacturing, sourcing, or distribution. Through our private label mattress solutions, you can sell our world-class mattresses under your brand. It's the easiest way to guarantee client satisfaction without having to do any of the leg work. We are already trusted by some of the leading mattress providers in the US. Having helped countless businesses succeed in the mattress market with our private label services, we would love to help you next.",
    cta: { label: 'Get Your Private Label', href: '/contact/' },
    image: introImage,
    imageAlt: 'Stacked foam mattress layers being prepared on the TFM production line',
    flip: false,
  },
  {
    id: 'product-development',
    title: 'Product Development',
    body: "We offer various styles of mattresses all with the highest quality and craftsmanship. If you prefer to develop your own unique product, we've got you covered there too! Our R&D team has years of experience and can help you produce a 100% unique and personalized mattress product which will fit your specific objectives!",
    cta: { label: "Let's Develop", href: '/contact/' },
    image: developImage,
    imageAlt: 'Close-up of open-cell foam structure used in TFM mattress development',
    flip: true,
  },
  {
    id: 'experience',
    title: 'Experience',
    body: "With decades of experience in the industry, we've developed a reputation as a trustworthy, dependable, and industry-leading foam mattress manufacturer and distributor. The wealth of our experience shines through in everything we do. From our premium-quality products to our unmatched customer service, our experience is evident.",
    cta: { label: 'Start Designing', href: '/contact/' },
    image: experienceImage,
    imageAlt: 'Finished mattresses moving through the TFM plant toward packaging',
    flip: false,
  },
] as const;

export const why = {
  kicker: 'Why TFM',
  headline: 'Why use our private label services?',
  /**
   * NOTE: "Ensuring Success" repeats verbatim the paragraph that also appears
   * in the standalone Private Label block above it on the live site. Kept as-is
   * for fidelity, but it reads as an authoring slip and is worth rewriting or
   * cutting — duplicate body copy on one page also weakens its SEO.
   */
  cards: [
    {
      title: 'Ensuring Success',
      image: whySewing,
      imageAlt: 'A TFM operator guiding a mattress edge through the tape-edge sewing machine',
      body: "Through our private label solutions, you can sell our premium-quality and innovative mattresses under your brand. It's the most effective and affordable way to provide your clients with industry-leading, premium mattress products. The top mattress companies in the country trust our mattress quality. You can too!",
    },
    {
      title: 'Unmatched Quality',
      image: whyMachinery,
      imageAlt: 'Heavy production machinery on the TFM factory floor',
      body: "One of the most important components of running a successful mattress company is sourcing premium-quality products. When you work with TFM, you're tapping into five decades worth of quality control, constant advancement, and industry-leading innovation.",
    },
    {
      title: 'Comprehensive Solutions',
      image: whyWorker,
      imageAlt: 'A TFM technician inspecting a quilted mattress panel on the production line',
      body: 'We offer some of the most complete private label services in the industry. On top of simply providing our innovative mattress products to businesses, we also provide product development, product design, shipping, and distribution services. We can handle everything so your business can thrive.',
    },
  ],
} as const;

export const closing = {
  eyebrow: 'Get In Touch',
  /* NOTE: live site reads "everything tfrom design" — typo corrected. */
  headline: "We'll handle everything from design and production to fulfillment.",
  cta: { label: 'Contact Us Now', href: '/contact/' },
} as const;
