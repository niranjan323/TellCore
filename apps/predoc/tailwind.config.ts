import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        surface: 'var(--surface)',
        'surface-secondary': 'var(--surface-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-hint': 'var(--text-hint)',
        border: 'var(--border)',
        error: 'var(--error)',
        success: 'var(--success)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        body: ['var(--font-body)'],
      },
      fontSize: {
        base: 'var(--font-size-base)',
      },
      spacing: {
        base: 'var(--spacing-base)',
      },
      maxWidth: {
        page: '720px',
        form: '600px',
        intro: '480px',
      },
    },
  },
  plugins: [],
};

export default config;
