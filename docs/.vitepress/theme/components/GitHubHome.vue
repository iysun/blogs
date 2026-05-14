<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import githubContent from '../../github-content.json'
import homeRepos from '../../data/home-repos.json'
import homePosts from '../../data/home-posts.json'
import { normalizeIssueLabels } from '../issue-labels'

const profile = githubContent.profile
const ghUser = profile.githubUsername || githubContent.owner
const avatarUrl = `https://github.com/${ghUser}.png?size=128`

const repos = computed(() => (Array.isArray(homeRepos) ? homeRepos : []))

type HomePost = {
  title: string
  date: string
  path: string
  issue: number
  labels?: unknown
}

const posts = computed(() => {
  const p = (homePosts as { posts?: HomePost[] }).posts
  return Array.isArray(p) ? p : []
})

function postLabels(post: HomePost) {
  return normalizeIssueLabels(post.labels)
}

const langColor: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Vue: '#41b883',
  Rust: '#dea584',
  Go: '#00ADD8',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Ruby: '#701516',
}

function colorFor(lang: string) {
  return langColor[lang] || '#737373'
}

function issueLabelsFromConfig(raw: unknown): string[] {
  if (raw == null) return []
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === 'string' ? x.trim() : String(x).trim()))
      .filter(Boolean)
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return []
    return t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

const issueLabelsList = computed(() =>
  issueLabelsFromConfig((githubContent as { issueLabel?: unknown }).issueLabel)
)

const onlyOwnerDefault = computed(() => {
  const v = (githubContent as { issuesOnlyRepoOwner?: boolean }).issuesOnlyRepoOwner
  return v !== false
})

const emptyPostsHint = computed(() => {
  const o = githubContent.owner
  const r = githubContent.repo
  const ownerNote = onlyOwnerDefault.value
    ? `默认只同步 ${o} 本人创建的 Issue（将 issuesOnlyRepoOwner 设为 false 可包含所有作者）。`
    : ''
  if (issueLabelsList.value.length) {
    const lbl = issueLabelsList.value.join('、')
    return `${ownerNote}在 ${o}/${r} 中为 Issue 至少添加以下任一 label：${lbl}，然后执行 pnpm content:sync。`
  }
  return `${ownerNote}在 ${o}/${r} 中创建 Issue 后执行 pnpm content:sync（当前未启用 label 过滤）。`
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace(/\//g, '.')
}
</script>

<template>
  <div class="gh-home">
    <!-- 极简个人信息区 - 大量留白 -->
    <header class="gh-profile">
      <div class="gh-profile-inner">
        <img class="gh-avatar" :src="avatarUrl" width="64" height="64" :alt="ghUser" />
        <div class="gh-profile-info">
          <h1 class="gh-name">{{ profile.displayName }}</h1>
          <p class="gh-bio">{{ profile.bio }}</p>
        </div>
      </div>
      <a
        class="gh-profile-link"
        :href="`https://github.com/${ghUser}`"
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="gh-profile-icon">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </header>

    <!-- 置顶仓库区 - 极简网格 -->
    <section v-if="repos.length" class="gh-section">
      <h2 class="gh-section-title">开源项目</h2>
      <ul class="gh-repo-grid">
        <li v-for="r in repos" :key="r.fullName" class="gh-repo-item">
          <a :href="r.url" class="gh-repo-link" target="_blank" rel="noreferrer">
            <span class="gh-repo-name">{{ r.fullName }}</span>
            <span v-if="r.language" class="gh-repo-lang">
              <span class="gh-lang-dot" :style="{ background: colorFor(r.language) }" />
              {{ r.language }}
            </span>
            <span class="gh-repo-stars">{{ r.stars }}</span>
          </a>
        </li>
      </ul>
    </section>

    <!-- 文章列表区 - 极简列表 -->
    <section v-if="posts.length" class="gh-section gh-posts">
      <h2 class="gh-section-title">文章</h2>
      <ul class="post-list" role="list">
        <li
          v-for="(post, index) in posts"
          :key="post.issue"
          class="post-item post-stagger-fade"
          :style="{ '--post-stagger-i': index }"
        >
          <a :href="withBase(post.path)" class="post-link">
            <div class="post-main">
              <h3 class="post-title">{{ post.title }}</h3>
              <div v-if="postLabels(post).length" class="post-labels">
                <span v-for="lb in postLabels(post)" :key="lb.name" class="site-issue-label">
                  {{ lb.name }}
                </span>
              </div>
            </div>
            <div class="post-meta">
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              <span class="post-issue">#{{ post.issue }}</span>
            </div>
          </a>
        </li>
      </ul>
    </section>

    <section v-else class="gh-section gh-empty">
      <p class="gh-empty-text">暂无文章</p>
      <p class="gh-empty-hint">{{ emptyPostsHint }}</p>
    </section>

    <!-- 极简页脚 -->
    <footer class="gh-footer">
      <p>© {{ new Date().getFullYear() }} {{ profile.displayName }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* 极简首页容器 */
.gh-home {
  max-width: 720px;
  margin: 0 auto;
  padding: 4rem 1.5rem 6rem;
  font-family: var(--site-font-sans);
}

/* 极简个人信息区 - 大量留白 */
.gh-profile {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4rem;
  padding-bottom: 3rem;
  border-bottom: none;
  background-image: var(--site-line-fade-h);
  background-size: 100% 1px;
  background-position: bottom;
  background-repeat: no-repeat;
}

.gh-profile-inner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.gh-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  filter: grayscale(20%);
  transition: filter var(--transition-fast);
}

.gh-avatar:hover {
  filter: grayscale(0%);
}

.gh-profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.gh-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--site-text-heading);
}

.gh-bio {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--site-text-muted);
  line-height: 1.5;
}

.gh-profile-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--site-text-muted);
  border-radius: 50%;
  transition:
    color var(--transition-link),
    background-color var(--transition-link);
}

.gh-profile-link:hover {
  color: var(--site-text-heading);
  background: color-mix(in srgb, var(--site-bg-hover) 85%, transparent);
}

.gh-profile-icon {
  width: 20px;
  height: 20px;
}

/* 区块通用样式 - 大量留白 */
.gh-section {
  margin-bottom: 4rem;
}

.gh-section-title {
  margin: 0 0 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--site-text-muted);
}

/* 极简仓库列表 - 无边框纯文字 */
.gh-repo-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gh-repo-item {
  border-bottom: 1px solid var(--site-border-light);
}

.gh-repo-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 0.625rem;
  margin-left: -0.625rem;
  margin-right: -0.625rem;
  border-radius: var(--site-radius-md);
  text-decoration: none;
  color: inherit;
  transition:
    padding-left var(--transition-link),
    background-color var(--transition-link);
}

.gh-repo-link:hover {
  padding-left: 1.125rem;
  background-color: color-mix(in srgb, var(--site-bg-hover) 72%, transparent);
}

.gh-repo-name {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--site-text-heading);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gh-repo-link:hover .gh-repo-name {
  color: var(--site-accent-hover);
}

.gh-repo-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--site-text-muted);
  white-space: nowrap;
}

.gh-lang-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.gh-repo-stars {
  font-size: 0.8125rem;
  color: var(--site-text-muted);
  font-variant-numeric: tabular-nums;
}

/* 极简文章列表 */
.gh-posts .gh-section-title {
  margin-bottom: 1rem;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.post-item {
  border-bottom: 1px solid var(--site-border-light);
}

.post-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2rem;
  padding: 1.25rem 0.625rem;
  margin-left: -0.625rem;
  margin-right: -0.625rem;
  border-radius: var(--site-radius-md);
  text-decoration: none;
  color: inherit;
  transition:
    padding-left var(--transition-link),
    background-color var(--transition-link);
}

.post-link:hover {
  padding-left: 1.125rem;
  background-color: color-mix(in srgb, var(--site-bg-hover) 72%, transparent);
}

.post-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--site-text-heading);
  letter-spacing: -0.01em;
  line-height: 1.4;
  transition: color var(--transition-link);
}

.post-link:hover .post-title {
  color: var(--site-accent-hover);
}

.post-labels {
  display: flex;
  gap: 0.75rem;
}

.post-meta {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  font-size: 0.8125rem;
  color: var(--site-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.post-issue {
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
}

/* 空状态 */
.gh-empty {
  text-align: center;
  padding: 4rem 0;
}

.gh-empty-text {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--site-text-heading);
}

.gh-empty-hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--site-text-muted);
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* 极简页脚 */
.gh-footer {
  margin-top: 6rem;
  padding-top: 2rem;
  border-top: none;
  background-image: var(--site-line-fade-h);
  background-size: 100% 1px;
  background-position: 0 0;
  background-repeat: no-repeat;
  text-align: center;
}

.gh-footer p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--site-text-muted);
}

/* 响应式优化 */
@media (max-width: 640px) {
  .gh-home {
    padding: 2.5rem 1rem 4rem;
  }

  .gh-profile {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
  }

  .gh-profile-inner {
    gap: 1rem;
  }

  .gh-avatar {
    width: 56px;
    height: 56px;
  }

  .gh-name {
    font-size: 1.25rem;
  }

  .gh-bio {
    font-size: 0.875rem;
  }

  .gh-section {
    margin-bottom: 3rem;
  }

  .post-link {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .gh-repo-link {
    flex-wrap: wrap;
  }

  .gh-repo-name {
    width: 100%;
  }

  .gh-footer {
    margin-top: 4rem;
  }
}

/* 深色模式微调 */
html.dark .gh-avatar {
  filter: grayscale(30%);
  opacity: 0.9;
}

html.dark .gh-avatar:hover {
  filter: grayscale(0%);
  opacity: 1;
}
</style>
