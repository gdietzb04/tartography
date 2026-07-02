import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF3E6",
        paper: "#FEF9EF",
        custard: "#F5D78E",
        yolk: "#D9822B",
        "yolk-deep": "#B5651D",
        crust: "#7A4A21",
        cocoa: "#3A2A1B",
        "cocoa-soft": "#6B573F",
        sage: "#66754C",
        berry: "#A64B35",
        line: "#E8DCC3",
      },
      fontFamily: {
        // Wordmark + editorial headings.
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        // Shop names — slab serif.
        name: ["var(--font-bitter)", "Georgia", "serif"],
        // Body + UI.
        body: ["var(--font-schibsted)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Single elevation scale used everywhere: card < raised < modal.
        card: "0 1px 3px rgba(58, 42, 27, 0.08), 0 1px 2px rgba(58, 42, 27, 0.05)",
        raised: "0 4px 12px rgba(58, 42, 27, 0.12)",
        modal: "0 12px 32px rgba(58, 42, 27, 0.18)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
