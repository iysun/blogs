<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useData, withBase } from 'vitepress'
import githubContent from '../../github-content.json'
import issueNav from '../../data/issue-nav.json'
import { normalizeIssueLabels } from '../issue-labels'

const { frontmatter } = useData()

const profile = githubContent.profile
const ghUser = profile.githubUsername || githubContent.owner
const avatarUrl = `https://github.com/${ghUser}.png?size=128`

// 文章标签
const labels = computed(() => normalizeIssueLabels(frontmatter.value.labels))

type NavEntry = { issue: number; path: string; title: string }
// 文章导航
const nav = computed(() => {
  const issue = frontmatter.value.issue
  if (issue == null || issue === '')
    return { prev: null as NavEntry | null, next: null as NavEntry | null }
  const key = String(issue)
  const by = (
    issueNav as {
      byIssue?: Record<string, { prev: NavEntry | null; next: NavEntry | null }>
    }
  ).byIssue
  const row = by?.[key]
  return {
    prev: row?.prev ?? null,
    next: row?.next ?? null,
  }
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\//g, '.')
}

// 阅读时间
const readingTime = ref(0)

onMounted(() => {
  const content = document.querySelector('.issue-post__content')
  if (content) {
    const text = content.textContent || ''
    const wordCount = text.trim().length
    readingTime.value = Math.max(1, Math.ceil(wordCount / 300))
  }
})
</script>

<template>
  <article class="issue-post">
    <!-- 文章头部 -->
    <header class="issue-post__header">
      <!-- 返回链接 -->
      <a :href="withBase('/')" class="issue-post__back">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        全部文章
      </a>

      <!-- 文章标题 -->
      <h1 class="issue-post__title">{{ frontmatter.title }}</h1>

      <!-- 文章元信息 -->
      <div class="issue-post__meta">
        <img
          class="issue-post__meta-avatar"
          :src="avatarUrl"
          width="24"
          height="24"
          :alt="ghUser"
        />
        <span class="issue-post__meta-author">{{ profile.displayName }}</span>
        <span class="issue-post__meta-sep">·</span>
        <time v-if="frontmatter.date" :datetime="frontmatter.date">{{
          formatDate(frontmatter.date)
        }}</time>
        <span class="issue-post__meta-sep">·</span>
        <span>{{ readingTime }} 分钟阅读</span>
        <span v-if="frontmatter.issueUrl" class="issue-post__meta-sep">·</span>
        <a
          v-if="frontmatter.issueUrl"
          :href="frontmatter.issueUrl"
          target="_blank"
          rel="noreferrer"
          class="issue-post__meta-link"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path
              d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </a>
        <!-- 标签 -->
        <ul v-if="labels.length" class="issue-post-labels" role="list" aria-label="标签">
          <li v-for="lb in labels" :key="lb.name" class="issue-post-label-item">
            <span class="site-issue-label">{{ lb.name }}</span>
          </li>
        </ul>
      </div>
    </header>

    <!-- 文章头图（可选） -->
    <div v-if="frontmatter.cover" class="issue-post__hero">
      <img :src="frontmatter.cover" :alt="frontmatter.title" class="issue-post__hero-image" />
    </div>

    <!-- 文章正文 -->
    <div class="issue-post__content">
      <Content />
    </div>

    <!-- 极简文章导航 - 纯文字链接 -->
    <nav v-if="nav.prev || nav.next" class="issue-post-nav" aria-label="文章导航">
      <a
        v-if="nav.prev"
        :href="withBase(nav.prev.path)"
        class="issue-post-nav__link issue-post-nav__link--prev"
      >
        <span class="issue-post-nav__label">← 上一篇</span>
        <span class="issue-post-nav__title">{{ nav.prev.title }}</span>
      </a>
      <span v-else class="issue-post-nav__placeholder"></span>

      <a
        v-if="nav.next"
        :href="withBase(nav.next.path)"
        class="issue-post-nav__link issue-post-nav__link--next"
      >
        <span class="issue-post-nav__label">下一篇 →</span>
        <span class="issue-post-nav__title">{{ nav.next.title }}</span>
      </a>
      <span v-else class="issue-post-nav__placeholder"></span>
    </nav>
  </article>
</template>

<style scoped>
.issue-post {
  animation: fadeInUp 0.45s var(--ease-out-expo) both;
}
</style>
