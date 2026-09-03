import { describe, it, expect } from 'vitest';
import { validate, looksAutomated, type ContactPayload } from '../../src/lib/contact';

const base: ContactPayload = {
  name: 'Nate Saadon',
  email: 'nate@example.com',
  subject: 'Private label enquiry',
  phone: '(215) 555-0134',
  message: 'We would like to discuss a private label mattress programme.',
  company: '',
  elapsedMs: 9000,
};

const make = (overrides: Partial<ContactPayload> = {}): ContactPayload => ({ ...base, ...overrides });

describe('validate', () => {
  it('accepts a well-formed submission', () => {
    expect(validate(base)).toEqual({});
  });

  it('requires name, email, subject and message', () => {
    const errors = validate(make({ name: '', email: '', subject: '', message: '' }));
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'subject']);
  });

  it('treats whitespace-only input as empty', () => {
    expect(validate(make({ name: '   ' })).name).toBeDefined();
  });

  it('leaves phone optional', () => {
    expect(validate(make({ phone: '' })).phone).toBeUndefined();
  });

  it('still checks the shape of a phone number when one is given', () => {
    expect(validate(make({ phone: 'call me' })).phone).toBeDefined();
    expect(validate(make({ phone: '+1 215-555-0134 x22' })).phone).toBeUndefined();
  });

  describe('email', () => {
    const valid = [
      'someone@example.com',
      'first.last@sub.example.co.uk',
      'name+tag@example.io',
      "o'brien@example.com",
      'user_name@example-host.com',
    ];
    const invalid = ['plainstring', 'no-at-sign.com', '@example.com', 'user@', 'user@host', 'a b@example.com'];

    it.each(valid)('accepts %s', (email) => {
      expect(validate(make({ email })).email).toBeUndefined();
    });

    it.each(invalid)('rejects %s', (email) => {
      expect(validate(make({ email })).email).toBeDefined();
    });
  });

  it('rejects a message that is too short to be useful', () => {
    expect(validate(make({ message: 'hi' })).message).toBeDefined();
  });

  it('enforces upper length limits', () => {
    expect(validate(make({ name: 'a'.repeat(101) })).name).toBeDefined();
    expect(validate(make({ message: 'a'.repeat(5001) })).message).toBeDefined();
  });
});

describe('looksAutomated', () => {
  it('passes a human filling the form at a normal pace', () => {
    expect(looksAutomated(base)).toBe(false);
  });

  it('catches a filled honeypot', () => {
    expect(looksAutomated(make({ company: 'Acme Corp' }))).toBe(true);
  });

  it('catches a submission faster than any person could type', () => {
    expect(looksAutomated(make({ elapsedMs: 300 }))).toBe(true);
  });
});
