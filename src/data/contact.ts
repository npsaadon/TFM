/** Contact page content, transcribed from the live site. */

import { contact } from './site';
import headerImage from '@assets/images/AdobeStock_448860824-min-scaled.jpeg';

export const meta = {
  title: 'Contact',
  description:
    'Talk to TFM about foam and private label mattress manufacturing. Call (800) 646-0112 or send us a message — we respond within 24–48 hours.',
} as const;

export const pageHeader = {
  title: 'Contact Us',
  breadcrumb: 'Contact Us',
  image: headerImage,
  /* Keeps the entrance doors in the banner crop instead of the roofline. */
  imagePosition: 'center 58%',
} as const;

export const cards = [
  {
    icon: 'phone',
    title: 'Phone',
    value: contact.phone,
    href: contact.phoneHref,
  },
  {
    icon: 'mail',
    title: 'Email',
    value: contact.email,
    href: contact.emailHref,
  },
  {
    icon: 'globe',
    title: 'Website',
    value: 'www.tfm-us.com',
    href: 'https://tfm-us.com/',
  },
  {
    icon: 'pin',
    title: 'Office Location',
    value: '1180 Church Rd, Lansdale, PA',
    href: contact.mapHref,
  },
] as const;

export const form = {
  /* NOTE: live site reads "Interested in discussing ?" — a word is missing
     after "discussing". Completed here. */
  headlineHtml: 'Interested in <em>discussing</em> your project?',
  body: "Reach out to us today to learn more about the services we offer. We'll be more than happy to answer any of your questions. Simply fill out the form below, and you'll get a response within 24–48 hours.",
  submitLabel: 'Send your message',
} as const;

export interface FormField {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'tel' | 'textarea';
  readonly placeholder: string;
  readonly required: boolean;
  readonly autocomplete?: string;
  readonly half: boolean;
}

export const fields: readonly FormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Enter name', required: true, autocomplete: 'name', half: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email', required: true, autocomplete: 'email', half: true },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Enter subject', required: true, half: true },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: 'Enter phone', required: false, autocomplete: 'tel', half: true },
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Enter message', required: true, half: false },
] as const;
