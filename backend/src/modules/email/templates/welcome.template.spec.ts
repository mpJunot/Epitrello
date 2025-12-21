import { generateWelcomeEmail } from './welcome.template';

describe('WelcomeTemplate', () => {
  const baseData = {
    email: 'user@example.com',
    name: 'Jane Smith',
  };

  describe('generateWelcomeEmail', () => {
    it('should generate email with all fields', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('text');
      expect(result.subject).toContain('Welcome to Epitrello');
      expect(result.html).toContain('Jane Smith');
      expect(result.html).toContain('Welcome to Epitrello');
    });

    it('should include dashboard link', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('/dashboard');
      expect(result.text).toContain('/dashboard');
      expect(result.html).toContain('Go to Dashboard');
    });

    it('should include documentation link', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('/docs');
      expect(result.text).toContain('/docs');
      expect(result.html).toContain('Documentation');
    });

    it('should include feature boxes', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('Create Boards');
      expect(result.html).toContain('Collaborate with Teams');
      expect(result.html).toContain('Track Progress');
    });

    it('should include emojis in HTML', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('🎉');
      expect(result.html).toContain('📋');
      expect(result.html).toContain('👥');
      expect(result.html).toContain('✅');
      expect(result.html).toContain('🚀');
    });

    it('should include emojis in text', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.text).toContain('🎉');
      expect(result.text).toContain('📋');
      expect(result.text).toContain('👥');
      expect(result.text).toContain('✅');
      expect(result.text).toContain('🚀');
    });

    it('should include congratulations message', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('Congratulations');
      expect(result.html).toContain('email has been verified');
      expect(result.text).toContain('Congratulations');
    });

    it('should include proper styling', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('font-family');
      expect(result.html).toContain('background');
      expect(result.html).toContain('gradient');
    });

    it('should include feature descriptions', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('kanban');
      expect(result.html).toContain('real-time');
      expect(result.html).toContain('checklists');
    });

    it('should include copyright year', () => {
      const result = generateWelcomeEmail(baseData);
      const currentYear = new Date().getFullYear();

      expect(result.html).toContain(currentYear.toString());
      expect(result.text).toContain(currentYear.toString());
    });

    it('should include The Epitrello Team signature', () => {
      const result = generateWelcomeEmail(baseData);

      expect(result.html).toContain('The Epitrello Team');
      expect(result.text).toContain('The Epitrello Team');
    });
  });
});
