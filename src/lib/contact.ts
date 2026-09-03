/**
 * Contact form submission adapter.
 *
 * ── Read this before wiring up a real backend ──────────────────────────────
 * Delivery is intentionally NOT connected yet. `submitContactForm` currently
 * resolves a simulated success so the whole form — validation, error states,
 * focus management, the success panel — can be built and tested for real.
 *
 * To go live, replace ONLY the body of `submitContactForm`. Nothing else in
 * the codebase needs to change: the component imports this one function and
 * knows nothing about how delivery happens.
 *
 * Whatever backend is chosen, two rules matter:
 *
 *   1. Re-validate on the server. Everything in this file runs in the
 *      visitor's browser and can be bypassed entirely with curl. Client
 *      validation is a courtesy to honest users, never a security control.
 *
 *   2. Never put an API key in this file. It ships to every visitor. Keys
 *      belong in a serverless function's environment, which the browser
 *      cannot read.
 */

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  phone: string;
  message: string;
  /** Honeypot — must be empty. Bots fill hidden fields; humans never see it. */
  company: string;
  /** Milliseconds between page load and submit. */
  elapsedMs: number;
}

export type FieldName = 'name' | 'email' | 'subject' | 'phone' | 'message';

export type ValidationErrors = Partial<Record<FieldName, string>>;

export interface SubmitResult {
  ok: boolean;
  message: string;
}

/** Anything faster than this is automated, not a person reading a form. */
const MIN_ELAPSED_MS = 2500;

const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  phone: 30,
  message: 5000,
} as const;

/**
 * Deliberately permissive email check.
 *
 * Strict RFC 5322 patterns reject plenty of valid addresses and are a classic
 * source of "your form says my email is invalid" complaints. The only thing
 * worth catching here is an obvious typo; real validity is proven by an email
 * arriving.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export function validate(payload: ContactPayload): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = payload.name.trim();
  const email = payload.email.trim();
  const subject = payload.subject.trim();
  const phone = payload.phone.trim();
  const message = payload.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length > LIMITS.name) errors.name = `Please keep this under ${LIMITS.name} characters.`;

  if (!email) errors.email = 'Please enter your email address.';
  else if (email.length > LIMITS.email) errors.email = 'That email address is too long.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';

  if (!subject) errors.subject = 'Please enter a subject.';
  else if (subject.length > LIMITS.subject)
    errors.subject = `Please keep this under ${LIMITS.subject} characters.`;

  // Optional, but validate the shape when something was typed.
  if (phone && !/^[\d\s()+.\-x]{7,}$/i.test(phone))
    errors.phone = 'Please enter a valid phone number, or leave this blank.';
  else if (phone.length > LIMITS.phone) errors.phone = 'That phone number is too long.';

  if (!message) errors.message = 'Please tell us how we can help.';
  else if (message.length < 10) errors.message = 'Please add a little more detail.';
  else if (message.length > LIMITS.message)
    errors.message = `Please keep this under ${LIMITS.message} characters.`;

  return errors;
}

/** True when the submission looks automated rather than human. */
export function looksAutomated(payload: ContactPayload): boolean {
  return payload.company.trim() !== '' || payload.elapsedMs < MIN_ELAPSED_MS;
}

export async function submitContactForm(payload: ContactPayload): Promise<SubmitResult> {
  // Silently accept and discard bot submissions. Reporting the rejection would
  // tell an attacker exactly which control caught them, so they could tune
  // around it. A human never sees this branch.
  if (looksAutomated(payload)) {
    return { ok: true, message: 'Thanks — your message has been sent.' };
  }

  const errors = validate(payload);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please correct the highlighted fields.' };
  }

  // ── Replace everything below this line when connecting a real backend. ────
  //
  // Example shape, once a /api/contact function exists:
  //
  //   const response = await fetch('/api/contact', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //   });
  //   if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  //   return { ok: true, message: 'Thanks — your message has been sent.' };

  if (import.meta.env.DEV) {
    console.info(
      '[contact] Delivery is not wired up yet. Payload that would be sent:',
      { ...payload, company: undefined, elapsedMs: undefined }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    ok: true,
    message: 'Thanks — your message has been sent. We respond within 24–48 hours.',
  };
}
