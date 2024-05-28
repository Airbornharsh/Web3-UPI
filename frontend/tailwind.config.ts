import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
      primary: '#19B784',
      'primary-dark': '#138a64',
      secondary: '#1E2423',
      background: '#161B19',
      color1: '#3B4046',
      color2: '#1DD79B',
      color3: '#F2F2F2',
      transparent: 'transparent',
      white: '#FFFFFF',
    },
  },
  plugins: [],
}
export default config
