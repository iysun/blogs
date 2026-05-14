import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import GitHubHome from './components/GitHubHome.vue'
import IssuePostLayout from './components/IssuePostLayout.vue'
import './content-tokens.css'
import './animations.css'
import './layout-shell.css'
import './blog-doc.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('GitHubHome', GitHubHome)
    app.component('IssuePostLayout', IssuePostLayout)
  },
} satisfies Theme
