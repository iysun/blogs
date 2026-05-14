# Eason Blog

基于 VitePress 构建的个人博客站点（`lang: zh-CN`）：首页为 GitHub 风格简介与仓库卡片，文章由仓库 Issues 经**手动同步**生成到仓库内的 Markdown 与 JSON，**构建不会访问 GitHub**。

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm docs:dev
```

本地开发默认访问 <http://localhost:5173/blogs/>（与 `docs/.vitepress/github-content.json` 中的 `base` 一致）。

### 构建生产版本

```bash
pnpm docs:build
```

仅打包当前仓库里已有的 `docs/` 与 `.vitepress/data` 内容，**不会**调用 GitHub API。

### 预览构建结果

```bash
pnpm docs:preview
```

## 从 GitHub Issues 同步内容

1. 编辑 [`docs/.vitepress/github-content.json`](docs/.vitepress/github-content.json)：
   - `owner` / `repo`：目标仓库（默认占位为 `YOUR_GITHUB_USERNAME`，请改成你的账号与仓库名）。
   - `issueLabel`：可选。可为**字符串**、**字符串数组**，或留空/省略。
     - 非空时：请求 GitHub API 的 `labels` 参数（多个时用逗号拼接）；返回带**其中任意一个** label 的 Issue（与 GitHub 列表行为一致）。
     - 字符串里若含英文逗号，会按逗号拆成多个 label 名（与数组写法等价）。
     - 示例：`"blog"`、`["blog","publish"]`、`"blog, draft"`。
     - **留空或省略**则拉取列表中的全部 Issue（仍排除 PR）。随后还会应用下面的作者过滤。
   - `issuesOnlyRepoOwner`：可选，**默认 `true`**。为 `true` 时只保留 **创建者登录名等于 `owner`** 的 Issue（即仓库所属用户/组织账号本人发的 Issue）；设为 `false` 时保留所有作者的 Issue。
   - `pinnedRepos`：首页「置顶仓库」区块展示的 `owner/repo` 列表，可为多个。
   - `profile`：首页展示用的昵称、简介、`githubUsername`（用于头像与 GitHub 链接）。`displayName` 同时用于自动生成站点标题（见下）。
   - `siteTitle`：可选。浏览器标签栏与站内标题；不写则为 `{profile.displayName} 的博客`，无昵称时为「博客」。
   - `postsPreviewLimit`：可选。**省略或 `null`** 时同步脚本会把全部已收录 Issue 写入首页列表；设为**正整数**时只保留按创建时间从新到旧排序后的前 N 条。
   - `base`：须与 VitePress 的 `base` 一致（当前为 `/blogs/`）。
2. 若使用 label：在 GitHub 上给要发布的 Issue 打上该 label；取消发布可去掉 label 后再次同步（会删除对应本地 `issue-*.md`）。若未使用 label，同步结果会随「当前 API 返回的、且通过作者过滤的」Issue 集合变化。
3. 在仓库根目录执行：

```bash
pnpm content:sync
```

脚本会：

- 写入 [`docs/issue-<编号>.md`](docs/)（与 `index.md` 同级，含 `syncedFromIssue: true`、`layout: IssuePostLayout`、`pageClass: blog-doc`、`readingTime`（按正文约 300 字/分钟估算），以及 Issue 的 **`labels`**：`{ name, color }[]`，`color` 为 GitHub 返回的 6 位十六进制、无 `#`）；
- 更新 [`docs/.vitepress/data/home-repos.json`](docs/.vitepress/data/home-repos.json)、[`home-posts.json`](docs/.vitepress/data/home-posts.json)（`posts[].labels` 与正文一致，供首页文章列表展示标签）以及 [`issue-nav.json`](docs/.vitepress/data/issue-nav.json)（按 Issue **创建时间升序**的上一篇/下一篇，供文章页脚使用）。

文章页通过 [`IssuePostLayout.vue`](docs/.vitepress/theme/components/IssuePostLayout.vue) 包裹 Markdown（`<Content />`）；**不会**使用默认 `doc` 布局的右侧大纲，文末 **上一篇/下一篇** 由 `issue-nav.json` + 主题页脚自行渲染。版式与正文样式由 [`blog-doc.css`](docs/.vitepress/theme/blog-doc.css)（选择器挂在 `.issue-post`）配合 `content-tokens` 完成。

站点**不生成**博客目录索引页；文章入口为首页列表与各篇 **`/issue-*`** 链接（相对站点根路径，部署在子路径时为 `/<base>/issue-*`）。主题配置为 **`sidebar: false`**，无左侧栏。

然后检查 `git diff`，确认无误后提交并推送。CI（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）只执行 `pnpm docs:build` 与部署，**不会在流水线里同步**。

### 鉴权

- 若目标仓库为**公开**，可不设 token（匿名有较低 API 限额）。
- 若需更高限额或访问**私有**仓库，在本地设置环境变量后执行同步：

```bash
export GH_TOKEN=ghp_xxx   # 或 GITHUB_TOKEN
pnpm content:sync
```

可选：若设置 `GITHUB_REPOSITORY=owner/repo`（例如部分 CI 环境），脚本会用它覆盖配置里的 `owner`/`repo`。

## 项目结构

| 路径 | 说明 |
|------|------|
| `docs/` | VitePress 文档根目录 |
| `docs/index.md` | 首页（GitHub 风布局组件） |
| `docs/issue-*.md` | 同步生成的 Issue 文章（与 `docs/index.md` 同级，URL 为 `/issue-<编号>`） |
| `docs/.vitepress/config.mts` | 站点与主题配置 |
| `docs/.vitepress/github-content.json` | Issues 与仓库卡片、首页资料的单一配置源 |
| `docs/.vitepress/data/` | 同步生成的 JSON（随仓库提交） |
| `docs/.vitepress/data/issue-nav.json` | 各 Issue 对应页的上一篇（更早）/下一篇（更晚）链接与标题 |
| `docs/.vitepress/theme/` | 自定义主题（扩展默认主题） |
| `docs/.vitepress/theme/content-tokens.css` | 内容区共用 CSS 变量（首页文章流与博客正文） |
| `docs/.vitepress/theme/components/IssuePostLayout.vue` | 同步 Issue 文章外壳（`layout: IssuePostLayout`，内嵌 `<Content />`） |
| `docs/.vitepress/theme/blog-doc.css` | 同步文章页样式（`pageClass: blog-doc` 下 `.issue-post`，使用 `content-tokens` 变量） |
| `scripts/sync-github-content.mjs` | 同步脚本 |

## 部署

推送到 `master` 分支后，GitHub Actions 会构建并推送到 `gh-pages` 分支。请确保 Pages 使用的 `base` 与仓库 Pages URL 一致（子路径部署时使用 `/blogs/`）。
