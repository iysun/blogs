import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import GitHubHome from './components/GitHubHome.vue'
import './content-tokens.css'
import './blog-doc.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {}),
  enhanceApp({ app }) {
    app.component('GitHubHome', GitHubHome)
  },
} satisfies Theme
