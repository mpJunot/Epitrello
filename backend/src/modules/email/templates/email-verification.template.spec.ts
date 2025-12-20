import { generateEmailVerificationEmail } from './email-verification.template';

describe('EmailVerificationTemplate', () => {
  const baseData = {
    email: 'user@example.com',
    name: 'John Doe',
    verificationToken: 'abc123token',
  };

  describe('generateEmailVerificationEmail', () => {
    it('should generate email with all fields', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.subject).toContain('Confirm your email');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('Welcome to Epitrello');
      expect(result.html).toContain(baseData.verificationToken);
    });

    it('should include verification link in HTML', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.html).toContain('/auth/verify-email?token=');
      expect(result.html).toContain(baseData.verificationToken);
      expect(result.html).toContain('Verify Email Address');
    });

    it('should include verification link in text', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.text).toContain('/auth/verify-email?token=');
      expect(result.text).toContain(baseData.verificationToken);
    });

    it('should include expiration warning', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.html).toContain('24 hours');
      expect(result.text).toContain('24 hours');
    });

    it('should include proper styling', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.html).toContain('font-family');
      expect(result.html).toContain('background');
      expect(result.html).toContain('padding');
    });

    it('should include warning box', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.html).toContain('warning');
      expect(result.html).toContain('Important');
    });

    it('should include user name', () => {
      const result = generateEmailVerificationEmail(baseData);

      expect(result.html).toContain(`Hello ${baseData.name}`);
      expect(result.text).toContain(`Hello ${baseData.name}`);
    });

    it('should include copyright year', () => {
      const result = generateEmailVerificationEmail(baseData);
      const currentYear = new Date().getFullYear();

      expect(result.html).toContain(currentYear.toString());
      expect(result.text).toContain(currentYear.toString());
    });
  });
});
