import { defineConfig } from 'vitepress'
import githubContent from './github-content.json'
import blogSidebar from './data/blog-sidebar.json'

const baseRaw = typeof githubContent.base === 'string' ? githubContent.base : '/blogs/'
const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
const ghProfile = githubContent.profile
const ghUser = ghProfile?.githubUsername || githubContent.owner

const examplesSidebar = [
  {
    text: 'Examples',
    items: [
      { text: 'Markdown Examples', link: '/markdown-examples' },
      { text: 'Runtime API Examples', link: '/api-examples' },
    ],
  },
]

const blogItems = [
  { text: 'Overview', link: '/blog/' },
  ...(Array.isArray(blogSidebar.items) ? blogSidebar.items : []),
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: 'Eason Site',
  description: 'Eason Blogs',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: {
      '/blog/': blogItems,
      '/markdown-examples': examplesSidebar,
      '/api-examples': examplesSidebar,
    },

    socialLinks: [{ icon: 'github', link: `https://github.com/${ghUser}` }],
  },
})
