import { extractEmails, extractPhones, extractExperience } from '../../src/utils/regex';

describe('regex utils', () => {
  test('extractEmails finds multiple and normalizes', () => {
    const text = 'Contact: Test.User+tag@Example.Co.Uk and admin@example.com';
    const emails = extractEmails(text);
    expect(emails).toEqual(expect.arrayContaining(['test.user+tag@example.co.uk', 'admin@example.com']))
  });

  test('extractPhones handles international formats', () => {
    const text = '+44 7700 900123, (987) 654-3210, +1-555-123-4567';
    const phones = extractPhones(text);
    expect(phones).toEqual(expect.arrayContaining(['447700900123','9876543210','15551234567']));
  });

  test('extractExperience parses decimals and years', () => {
    expect(extractExperience('Total experience: 4.5 years')).toBeCloseTo(4.5);
    expect(extractExperience('Experience: 3 yrs')).toBeCloseTo(3);
    expect(extractExperience('5+ years of experience')).toBeCloseTo(5);
    expect(extractExperience('no experience mentioned')).toBeNull();
  });
});
