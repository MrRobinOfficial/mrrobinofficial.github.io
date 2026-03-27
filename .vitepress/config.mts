import { defineConfig } from "vitepress"

// Plugins
import tailwindcss from "@tailwindcss/vite"

// import Components from "unplugin-vue-components/vite"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [tailwindcss()],
  },
  base: "/mrrobinofficial.github.io",
  srcDir: "./src",
  srcExclude: ["**/README.md", "**/TODO.md"],
  lang: "en-US",
  title: "Robin",
  description:
    "Robin's personal website. I'm a software engineer from Sweden, building everything from game engines in C++ to web apps.",
  head: [
    // Fallback (important)
    ["link", { rel: "icon", href: "/favicon.ico" }],

    // Light mode
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo-light.svg",
        media: "(prefers-color-scheme: light)",
      },
    ],

    // Dark mode
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo-dark.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  ],
  themeConfig: {
    logo: {
      light: "/logo-light.svg",
      dark: "/logo-dark.svg",
      alt: "Robin logo",
    },
    search: {
      provider: "local",
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Projects", link: "/projects", activeMatch: "/projects" },
      { text: "Blog", link: "/blog", activeMatch: "/blog" },
      { text: "About", link: "/about" },
    ],
    sidebar: {
      "/blog/": [
        {
          text: "Programming",
          collapsed: false,
          items: [
            {
              text: "UTF-8 in C++ on Windows",
              link: "/blog/programming/utf8-console-issues-in-cpp",
            },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/MrRobinOfficial" },
      { icon: "youtube", link: "https://youtube.com/@MrRobinOfficial" },
      { icon: "instagram", link: "https://instagram.com/mrrobinftw" },
    ],
  },
})
