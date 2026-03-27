// https://vitepress.dev/guide/custom-theme
import { h } from "vue"
import type { Theme } from "vitepress"
import DefaultTheme from "vitepress/theme"
import "./style.css"

// Pages
import {
  HomePage,
  ProjectsPage,
  BlogPage,
  AboutPage,
  MusicPage,
  WorkInProgressPage,
} from "#components/pages"

// UI
import { YouTube } from "#components/ui"

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // Pages
    app.component("HomePage", HomePage)
    app.component("ProjectsPage", ProjectsPage)
    app.component("BlogPage", BlogPage)
    app.component("AboutPage", AboutPage)
    app.component("MusicPage", MusicPage)
    app.component("WorkInProgress", WorkInProgressPage)

    // UI
    app.component("YouTube", YouTube)
  },
} satisfies Theme
