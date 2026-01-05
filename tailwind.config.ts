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
                // Notion-style dark theme
                dark: {
                    bg: "#191919",
                    surface: "#252525",
                    elevated: "#2f2f2f",
                    border: "#3d3d3d",
                    text: "#e6e6e6",
                    muted: "#9b9b9b",
                    accent: "#2383e2",
                },
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "check": "check 0.3s ease-out",
                "pulse-soft": "pulseSoft 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                check: {
                    "0%": { transform: "scale(0.8)" },
                    "50%": { transform: "scale(1.1)" },
                    "100%": { transform: "scale(1)" },
                },
                pulseSoft: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.7" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
