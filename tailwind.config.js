/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        fg: 'var(--fg)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        info: 'var(--info)'
      }
    }
  },
  plugins: []
};
