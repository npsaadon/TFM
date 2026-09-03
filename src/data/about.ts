/** About page content, transcribed from the live site. */

import aboutImage from '@assets/images/36f503_eefb0fcb73ca4e8785b8f34608f6f05bmv2.avif';
import headerImage from '@assets/images/kathyryn-tripp-6abl43xbcx8-unsplash.jpg';
import trustImage from '@assets/images/3.jpg';
import usaImage from '@assets/images/AdobeStock_221180978-min-scaled.jpeg';
import factoryFloor from '@assets/images/AdobeStock_919108809-min-2048x1365.jpeg';

export const meta = {
  title: 'About',
  description:
    'TFM manufactures high-quality custom foam and mattresses in the United States, with private label solutions, warehousing, and drop shipping for brands worldwide.',
} as const;

export const pageHeader = {
  title: 'About Us',
  breadcrumb: 'About Us',
  image: headerImage,
} as const;

/** Shares the same copy block as the homepage intro — single source, reused. */
export { about as intro } from './home';

export { aboutImage };

/**
 * NOTE: the live site marks both of these as <h3> headings even though they are
 * body copy. That creates a heading outline of three sibling h3s with no
 * content under them, which screen readers announce as an empty structure.
 * They are lead paragraphs here, which is what they actually are.
 */
export const statements = [
  'Our manufacturing facility is located right here in the United States, ensuring fast lead times, strict quality control, and dependable service.',
  'Our team is made up of highly skilled professionals dedicated to producing top-quality foam products for a wide range of industries. From off-the-shelf options to fully custom private label solutions, we help our clients bring their vision to life with precision and efficiency. We also offer flexible services like warehousing and drop shipping, so you can scale confidently — without the overhead.',
] as const;

export const madeInUsa = {
  kicker: 'TFM',
  headlineHtml: 'Proudly Made in the <em>USA</em>',
  /* The flag-painted loading dock doors from the live site — the strongest
     made-in-USA image in the library. */
  background: usaImage,
  paragraphs: [
    "At TFM, we specialize in high-quality, custom foam manufacturing — proudly built in the United States. We serve a wide range of industries with dependable private label solutions, engineered to meet the highest standards. Whether you're looking for off-the-shelf foam components or fully customized products, we deliver with speed, precision, and care.",
    'We also offer warehousing and drop shipping directly from our facility, giving you the flexibility to scale your business without added overhead.',
  ],
} as const;

export const customization = {
  image: factoryFloor,
  imageAlt: 'Mattresses moving through production on the TFM factory floor',
  headline:
    'We offer a broad range of premium mattress types and can personalize anything to your unique specifications.',
  body: "We can even create custom branding to bring your mattress products to life. The TFM team will go a step further than most competitors by offering full-service shipping and logistics solutions so you don't have to worry about anything. We'll handle everything from the design and production to the fulfillment.",
} as const;

export const trustBanner = {
  eyebrow: 'Get In Touch',
  headline: 'The top mattress companies in the country trust our mattress quality.',
  cta: { label: 'Get Your Private Label', href: '/private-label/' },
  background: trustImage,
} as const;
