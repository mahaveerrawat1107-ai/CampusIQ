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
        background: "#F7F8FC",
        surface: "#FFFFFF",
        navy: {
          DEFAULT: "#292D45",
          muted: "#474D6E",
        },
        indigo: {
          DEFAULT: "#635BFF",
          hover: "#534BEA",
          subtle: "#F0EFFF",
        },
        neutral: {
          secondary: "#687086",
          border: "#E9EAF1",
          light: "#F7F8FC",
        },
        semantic: {
          success: "#0D9488",
          "success-subtle": "#E6F7F5",
          warning: "#F59E0B",
          "warning-subtle": "#FEF7E9",
          error: "#DC5252",
          "error-subtle": "#FDF2F2",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        "card-sm": "14px",
        input: "12px",
        "input-sm": "10px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(41, 45, 69, 0.04), 0 1px 2px -1px rgba(41, 45, 69, 0.02)",
        subtle: "0 2px 6px 0 rgba(41, 45, 69, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
