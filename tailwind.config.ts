import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#fee2e2",
                    100: "#fecaca",
                    200: "#fca5a5",
                    300: "#f87171",
                    400: "#ef4444",
                    500: "#ea1d2c",
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                    DEFAULT: "#ea1d2c",
                    foreground: "#ffffff",
                },
            },
        },
    },
    darkMode: "class",
    plugins: [
        heroui({
            themes: {
                light: {
                    colors: {
                        primary: {
                            DEFAULT: "#ea1d2c",
                            foreground: "#ffffff",
                        },
                    },
                },
                dark: {
                    colors: {
                        primary: {
                            DEFAULT: "#ea1d2c",
                            foreground: "#ffffff",
                        },
                    },
                },
            },
        }),
    ],
}
