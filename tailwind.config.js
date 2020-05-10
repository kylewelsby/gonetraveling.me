const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      height: {
        hero: '512px'
      },
      colors: {
        gray: {
          100: "#F1F1F1",
          200: "#DCDCDC",
          300: "#C7C7C7",
          400: "#9D9D9D",
          500: "#737373",
          600: "#686868",
          700: "#454545",
          800: "#343434",
          900: "#232323"
        },
        orange: {
          100: "#FEECEA",
          200: "#FDD1CB",
          300: "#FBB5AB",
          400: "#F97D6C",
          500: "#F6452D",
          600: "#DD3E29",
          700: "#94291B",
          800: "#6F1F14",
          900: "#4A150E"
        }
      },
      fontFamily: {
        sans: [
          'Raleway', ...defaultTheme.fontFamily.sans
        ]
      }
    }
  },
  variants: {},
  plugins: [
    require("tailwindcss-hyphens")
  ]
};
