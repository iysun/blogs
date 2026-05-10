<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import githubContent from '../../github-content.json'
import homeRepos from '../../data/home-repos.json'
import homePosts from '../../data/home-posts.json'

const profile = githubContent.profile
const ghUser = profile.githubUsername || githubContent.owner
const avatarUrl = `https://github.com/${ghUser}.png?size=128`

const repos = computed(() => (Array.isArray(homeRepos) ? homeRepos : []))

const posts = computed(() => {
  const p = (homePosts as { posts?: { title: string; date: string; path: string; issue: number }[] }).posts
  return Array.isArray(p) ? p : []
})

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
  return langColor[lang] || '#8b949e'
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

/** 与同步脚本一致：非空则只展示带其中任一 label 的 Issue */
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
</script>

<template>
  <div class="gh-home">
    <section class="gh-profile">
      <img class="gh-avatar" :src="avatarUrl" width="120" height="120" :alt="ghUser" />
      <div class="gh-profile-text">
        <h1 class="gh-name">{{ profile.displayName }}</h1>
        <p class="gh-bio">{{ profile.bio }}</p>
        <a
          class="gh-profile-link"
          :href="`https://github.com/${ghUser}`"
          target="_blank"
          rel="noreferrer"
        >
          在 GitHub 查看 @{{ ghUser }}
        </a>
      </div>
    </section>

    <section v-if="repos.length" class="gh-section">
      <h2 class="gh-section-title">置顶仓库</h2>
      <ul class="gh-repo-grid">
        <li v-for="r in repos" :key="r.fullName" class="gh-repo-card">
          <a :href="r.url" class="gh-repo-link" target="_blank" rel="noreferrer">
            <div class="gh-repo-head">
              <span class="gh-repo-icon" aria-hidden="true">📦</span>
              <span class="gh-repo-name">{{ r.fullName }}</span>
            </div>
            <p class="gh-repo-desc">{{ r.description || '暂无描述。' }}</p>
            <div class="gh-repo-meta">
              <span v-if="r.language" class="gh-lang">
                <span class="gh-lang-dot" :style="{ background: colorFor(r.language) }" />
                {{ r.language }}
              </span>
              <span class="gh-stars">★ {{ r.stars }}</span>
            </div>
          </a>
        </li>
      </ul>
    </section>

    <section v-if="posts.length" class="gh-section">
      <h2 class="gh-section-title">最新文章</h2>
      <ul class="gh-post-list">
        <li v-for="post in posts" :key="post.issue" class="gh-post-row">
          <a :href="withBase(post.path)" class="gh-post-title">{{ post.title }}</a>
          <span class="gh-post-date">{{ post.date }}</span>
        </li>
      </ul>
      <p class="gh-more">
        <a :href="withBase('/blog/')" class="gh-inline-link">查看全部文章 →</a>
      </p>
    </section>

    <section v-else class="gh-section gh-muted">
      <p>暂无文章。{{ emptyPostsHint }}</p>
    </section>
  </div>
</template>

<style scoped>
.gh-home {
  max-width: 980px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.gh-profile {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 2rem;
}

.gh-avatar {
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.gh-name {
  margin: 0 0 0.35rem;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.gh-bio {
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.gh-profile-link {
  font-size: 0.95rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.gh-profile-link:hover {
  text-decoration: underline;
}

.gh-section {
  margin-bottom: 2.5rem;
}

.gh-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
}

.gh-repo-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.gh-repo-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.15s;
}
.gh-repo-card:hover {
  border-color: var(--vp-c-brand-1);
}

.gh-repo-link {
  display: block;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.gh-repo-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.gh-repo-name {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  font-size: 0.95rem;
}

.gh-repo-desc {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.45;
  min-height: 2.6em;
}

.gh-repo-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.gh-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.gh-lang-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.gh-post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

.gh-post-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.gh-post-row:last-child {
  border-bottom: none;
}

.gh-post-title {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}
.gh-post-title:hover {
  text-decoration: underline;
}

.gh-post-date {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.gh-more {
  margin: 0.75rem 0 0;
}

.gh-inline-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 0.9rem;
}
.gh-inline-link:hover {
  text-decoration: underline;
}

.gh-muted {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.6;
}

.gh-muted code {
  font-size: 0.85em;
}
</style>
