import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#090560",
        accent: "#6366f1",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        "light-purple": "#f3f0ff",
      },
    },
  },
  plugins: [],
};
export default config;
