/**
 * Site-wide constants: navigation, contact details, and default metadata.
 *
 * Everything the header, footer and utility bar render comes from here, so
 * changing a phone number or a menu label is a one-line edit in one file
 * rather than a hunt through four pages of markup.
 */

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
}

export const site = {
  name: 'TFM US',
  legalName: 'TFM US',
  tagline: 'Leaders in foam and mattress innovations worldwide',
  url: 'https://tfm-us.com',
  description:
    'TFM US is a U.S.-based foam and mattress manufacturer offering private label solutions, warehousing, and drop shipping for the world&rsquo;s leading mattress brands.',
  founded: '1972',
} as const;

export const contact = {
  phone: '(800) 646-0112',
  phoneHref: 'tel:+18006460112',
  email: 'info@tfm-us.com',
  emailHref: 'mailto:info@tfm-us.com',
  address: {
    street: '1180 Church Rd',
    city: 'Lansdale',
    region: 'PA',
    postalCode: '19446',
    country: 'USA',
    full: '1180 Church Rd, Lansdale, PA, USA',
  },
  /** Google Maps deep link — no embedded iframe, so no third-party tracking. */
  mapHref: 'https://www.google.com/maps/search/?api=1&query=1180+Church+Rd,+Lansdale,+PA',
} as const;

export const nav: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Private Label', href: '/private-label/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const footerNav = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about/' },
    { label: 'Contact Us', href: '/contact/' },
  ],
  privateLabel: [
    { label: 'Private Label', href: '/private-label/' },
    { label: 'Product Development', href: '/private-label/#product-development' },
    { label: 'Experience', href: '/private-label/#experience' },
  ],
} as const satisfies Record<string, readonly NavItem[]>;

/**
 * Social links.
 *
 * The live WordPress site renders four social icons whose `href` attributes are
 * empty strings — they are dead links that trap keyboard and screen-reader
 * users. Rather than reproduce that, this list stays empty and the UI hides the
 * social row entirely. Add the real profile URLs here and the icons reappear
 * automatically, everywhere, with no markup changes.
 */
export const socials: readonly SocialLink[] = [] as const;

