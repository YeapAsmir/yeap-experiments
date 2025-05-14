/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "San Francisco", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      colors: {
        gray: {
          2: "#fdfdfd",    
          3: "#fafafa",    
          4: "#f7f7f7",    
          5: "#f3f3f3",    
          6: "#f1f1f1",    
          7: "#ebebeb",    
          8: "#e3e3e3",    
          9: "#d4d4d4",    
          10: "#cccccc",   
          11: "#b5b5b5",   
          12: "#8a8a8a",   
          13: "#616161",   
          14: "#4a4a4a",   
          15: "#303030",   
          16: "#1a1a1a",
        },
        focus: "#005bd3",  // couleur d'accent/focus
      },
      borderRadius: {
        none: "0",
        xs: "0.25rem",  // border-radius-100
        sm: "0.5rem",   // border-radius-200
        md: "0.75rem",  // border-radius-300
      },
      boxShadow: {
        xs: "0 0.0625rem 0 0 rgba(26, 26, 26, 0.07)",  // shadow-100
        "bevel-xs": "0.0625rem 0 0 0 rgba(0, 0, 0, 0.13) inset, -0.0625rem 0 0 0 rgba(0, 0, 0, 0.13) inset, 0 -0.0625rem 0 0 rgba(0, 0, 0, 0.17) inset, 0 0.0625rem 0 0 hsla(0, 0%, 80%, 0.5) inset",  // shadow-bevel-100
        md: "0 0.25rem 0.375rem -0.125rem rgba(26, 26, 26, 0.2)",  // shadow-300
        button: "0 -0.0625rem 0 0 #b5b5b5 inset, 0 0 0 0.0625rem rgba(0, 0, 0, 0.1) inset, 0 0.03125rem 0 0.09375rem #fff inset",
      },
      spacing: {
        "025": "0.0625rem",  // space-025
        "050": "0.125rem",   // space-050
        100: "0.25rem",      // space-100
        150: "0.375rem",     // space-150
        200: "0.5rem",       // space-200
        300: "0.75rem",      // space-300
        400: "1rem",         // space-400
        500: "1.25rem",      // space-500
        800: "2rem",         // space-800
        1200: "3rem",        // space-1200
      },
      fontWeight: {
        medium: "550",
        semibold: "650",
        bold: "700",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],      // text-body-sm
        sm: ["0.8125rem", { lineHeight: "1.25rem" }], // text-body-md
      },
      height: {
        500: "1.25rem",
        700: "1.75rem",
        800: "2rem",
        header: "60px",
      },
      width: {
        500: "1.25rem",
        700: "1.75rem",
        800: "2rem",
      },
      zIndex: {
        1: "100",
        2: "400",
      },
    },
  },
  plugins: [],
}