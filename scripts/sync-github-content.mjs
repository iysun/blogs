#!/usr/bin/env node
/**
 * Fetches GitHub Issues (optional label filter) and repo metadata, writes docs under docs/blog
 * and JSON under docs/.vitepress/data/. Run manually: pnpm content:sync
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')
const blogDir = path.join(docsDir, 'blog')
const vpDir = path.join(docsDir, '.vitepress')
const dataDir = path.join(vpDir, 'data')
const configPath = path.join(vpDir, 'github-content.json')

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content, 'utf8')
}

function toIsoDate(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 10)
}

/**
 * GitHub `labels` 查询参数为逗号分隔；满足**任一** label 的 Issue 会被返回。
 * @param {unknown} raw 字符串、字符串数组，或空
 * @returns {{ apiValue: string, labels: string[] }}
 */
function normalizeIssueLabels(raw) {
  if (raw == null) return { apiValue: '', labels: [] }
  if (Array.isArray(raw)) {
    const labels = raw
      .map((x) => (typeof x === 'string' ? x.trim() : String(x).trim()))
      .filter(Boolean)
    return { apiValue: labels.join(','), labels }
  }
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t) return { apiValue: '', labels: [] }
    const labels = t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return { apiValue: labels.join(','), labels }
  }
  return { apiValue: '', labels: [] }
}

async function main() {
  if (!fs.existsSync(configPath)) {
    console.error('Missing', configPath)
    process.exit(1)
  }

  let config = readJson(configPath)
  const envRepo = process.env.GITHUB_REPOSITORY
  if (envRepo && envRepo.includes('/')) {
    const [o, r] = envRepo.split('/')
    if (o && r) {
      config = { ...config, owner: o, repo: r }
      console.log('Using GITHUB_REPOSITORY:', envRepo)
    }
  }

  const { owner, repo, base, pinnedRepos, profile, postsPreviewLimit } = config
  const { apiValue: issueLabelsApi, labels: issueLabelsList } = normalizeIssueLabels(config.issueLabel)
  /** 仅同步仓库 owner（配置里的 owner 字段）创建的 Issue；设为 false 则包含所有作者 */
  const issuesOnlyRepoOwner = config.issuesOnlyRepoOwner !== false

  if (!owner || !repo) {
    console.error('github-content.json must define owner, repo')
    process.exit(1)
  }
  if (owner === 'YOUR_GITHUB_USERNAME' || repo === 'YOUR_GITHUB_USERNAME') {
    console.warn(
      'Warning: edit docs/.vitepress/github-content.json (owner/repo) or set GITHUB_REPOSITORY before syncing.'
    )
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  async function ghJson(urlPath) {
    const res = await fetch(`https://api.github.com${urlPath}`, { headers })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`${urlPath} -> ${res.status}: ${text.slice(0, 500)}`)
    }
    return text ? JSON.parse(text) : null
  }

  if (issueLabelsApi) {
    console.log('Issue filter: labels (any match) =', issueLabelsList.join(', '))
  } else {
    console.log('Issue filter: no label (all issues from list, then author filter)')
  }
  if (issuesOnlyRepoOwner) {
    console.log('Author filter: only issues created by repo owner', owner)
  }

  /** @type {any[]} */
  const rawIssues = []
  let page = 1
  for (;;) {
    const q = new URLSearchParams({
      state: 'all',
      per_page: '100',
      page: String(page),
    })
    if (issueLabelsApi) {
      q.set('labels', issueLabelsApi)
    }
    const batch = await ghJson(`/repos/${owner}/${repo}/issues?${q}`)
    if (!Array.isArray(batch) || batch.length === 0) break
    for (const issue of batch) {
      if (issue.pull_request) continue
      rawIssues.push(issue)
    }
    if (batch.length < 100) break
    page += 1
  }

  const ownerLc = String(owner).toLowerCase()
  const issues = issuesOnlyRepoOwner
    ? rawIssues.filter((i) => i.user && String(i.user.login).toLowerCase() === ownerLc)
    : rawIssues

  issues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const activeNumbers = new Set(issues.map((i) => i.number))
  fs.mkdirSync(blogDir, { recursive: true })

  if (fs.existsSync(blogDir)) {
    for (const name of fs.readdirSync(blogDir)) {
      const m = /^issue-(\d+)\.md$/.exec(name)
      if (!m) continue
      const n = Number(m[1])
      if (!activeNumbers.has(n)) {
        fs.unlinkSync(path.join(blogDir, name))
        console.log('Removed stale', name)
      }
    }
  }

  const labelNames = (issue) =>
    Array.isArray(issue.labels) ? issue.labels.map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean) : []

  for (const issue of issues) {
    const fn = `issue-${issue.number}.md`
    const fp = path.join(blogDir, fn)
    const title = issue.title || `第 ${issue.number} 号 Issue`
    const date = toIsoDate(issue.created_at)
    const issueUrl = issue.html_url || `https://github.com/${owner}/${repo}/issues/${issue.number}`
    const labels = labelNames(issue)
    const body = issue.body || ''
    const fm = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `date: ${date}`,
      `issue: ${issue.number}`,
      `issueUrl: ${JSON.stringify(issueUrl)}`,
      `labels: ${JSON.stringify(labels)}`,
      'syncedFromIssue: true',
      'pageClass: blog-doc',
      '---',
      '',
      body.trimEnd(),
      '',
    ].join('\n')
    writeFile(fp, fm)
    console.log('Wrote', path.relative(repoRoot, fp))
  }

  const previewN = Number(postsPreviewLimit) > 0 ? Number(postsPreviewLimit) : 8
  const baseNorm = typeof base === 'string' && base.endsWith('/') ? base : `${base || '/'}/`
  const postsMeta = issues.slice(0, previewN).map((issue) => ({
    title: issue.title || `第 ${issue.number} 号 Issue`,
    date: toIsoDate(issue.created_at),
    path: `/blog/issue-${issue.number}`,
    issue: issue.number,
  }))

  writeFile(
    path.join(dataDir, 'home-posts.json'),
    JSON.stringify(
      {
        posts: postsMeta,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ) + '\n'
  )

  const sidebarItems = issues.map((issue) => ({
    text: issue.title || `第 ${issue.number} 号 Issue`,
    link: `/blog/issue-${issue.number}`,
  }))
  writeFile(path.join(dataDir, 'blog-sidebar.json'), JSON.stringify({ items: sidebarItems }, null, 2) + '\n')

  const reposList = Array.isArray(pinnedRepos) ? pinnedRepos : []
  const repoCards = []
  for (const full of reposList) {
    const [ro, rr] = String(full).split('/')
    if (!ro || !rr) continue
    try {
      const r = await ghJson(`/repos/${ro}/${rr}`)
      repoCards.push({
        name: r.name,
        fullName: r.full_name,
        description: r.description || '',
        stars: r.stargazers_count ?? 0,
        language: r.language || '',
        url: r.html_url || `https://github.com/${ro}/${rr}`,
        topics: Array.isArray(r.topics) ? r.topics.slice(0, 5) : [],
      })
    } catch (e) {
      console.warn('Repo fetch failed', full, e.message)
    }
  }
  writeFile(path.join(dataDir, 'home-repos.json'), JSON.stringify(repoCards, null, 2) + '\n')

  const blogIndexLines = [
    '---',
    'title: 博客',
    'description: 由 GitHub Issues 同步的文章',
    'pageClass: blog-doc',
    '---',
    '',
    '# 博客',
    '',
    issueLabelsApi
      ? '以下文章由 GitHub Issues 同步，需至少包含以下**任一** label：' +
          issueLabelsList.map((l) => '`' + l + '`').join('、') +
          '。' +
          (issuesOnlyRepoOwner
            ? '默认仅包含仓库所有者 `' + owner + '` 创建的 Issue（可在配置中关闭 `issuesOnlyRepoOwner`）。'
            : '') +
          ' 修改 Issue 后请重新执行 `pnpm content:sync`。'
      : '以下文章由 GitHub Issues 同步（未按 label 过滤）。' +
          (issuesOnlyRepoOwner
            ? '默认仅包含仓库所有者 `' + owner + '` 创建的 Issue（可在配置中关闭 `issuesOnlyRepoOwner`）。'
            : '') +
          ' 修改 Issue 后请重新执行 `pnpm content:sync`。',
    '',
    '## 全部文章',
    '',
  ]
  if (issues.length === 0) {
    blogIndexLines.push('_目前没有符合条件的 Issue。_', '')
  } else {
    for (const issue of issues) {
      const t = issue.title || `第 ${issue.number} 号 Issue`
      blogIndexLines.push(`- [${t}](./issue-${issue.number}.md)`, '')
    }
  }
  writeFile(path.join(blogDir, 'index.md'), blogIndexLines.join('\n'))

  console.log('Synced', issues.length, 'issues,', repoCards.length, 'repos.')
  console.log('Data written to docs/.vitepress/data/ and docs/blog/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
