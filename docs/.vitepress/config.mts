import { defineConfig } from 'vitepress'
import githubContent from './github-content.json'

const baseRaw = typeof githubContent.base === 'string' ? githubContent.base : '/blogs/'
const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`
const ghProfile = githubContent.profile
const ghUser = ghProfile?.githubUsername || githubContent.owner

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  base,
  title: 'Eason 的博客',
  description: '基于 GitHub Issues 与 VitePress 的个人站点',
  themeConfig: {
    siteTitle: 'Eason 的博客',

    nav: [{ text: '首页', link: '/' }],

    sidebar: false,

    outline: { label: '本页目录', level: 'deep' },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    skipToContentLabel: '跳至正文',

    socialLinks: [{ icon: 'github', link: `https://github.com/${ghUser}` }],
  },
})
