# Eason Blog

基于 VitePress 构建的个人博客站点：首页为 GitHub 风格简介与仓库卡片，文章由仓库 Issues（指定 label）经**手动同步**生成到仓库内的 Markdown 与 JSON，**构建不会访问 GitHub**。

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
   - `issueLabel`：只有带该 label 的 Issue 会生成文章（例如 `blog`）。
   - `pinnedRepos`：首页「Pinned repositories」展示的 `owner/repo` 列表，可为多个。
   - `profile`：首页展示用的昵称、简介、`githubUsername`（用于头像与 GitHub 链接）。
   - `base`：须与 VitePress 的 `base` 一致（当前为 `/blogs/`）。
2. 在 GitHub 上给要发布的 Issue 打上上述 label；取消发布可去掉 label 后再次同步（会删除对应本地 `issue-*.md`）。
3. 在仓库根目录执行：

```bash
pnpm content:sync
```

脚本会：

- 写入 [`docs/blog/issue-<编号>.md`](docs/blog/)（含 `syncedFromIssue: true`）；
- 更新 [`docs/blog/index.md`](docs/blog/index.md) 的文章列表；
- 更新 [`docs/.vitepress/data/home-repos.json`](docs/.vitepress/data/home-repos.json)、[`home-posts.json`](docs/.vitepress/data/home-posts.json)、[`blog-sidebar.json`](docs/.vitepress/data/blog-sidebar.json)。

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
| `docs/blog/` | 同步生成的博客 Markdown（`issue-*.md`） |
| `docs/.vitepress/config.mts` | 站点与主题配置 |
| `docs/.vitepress/github-content.json` | Issues 与仓库卡片、首页资料的单一配置源 |
| `docs/.vitepress/data/` | 同步生成的 JSON（随仓库提交） |
| `docs/.vitepress/theme/` | 自定义主题（扩展默认主题） |
| `scripts/sync-github-content.mjs` | 同步脚本 |

## 部署

推送到 `master` 分支后，GitHub Actions 会构建并推送到 `gh-pages` 分支。请确保 Pages 使用的 `base` 与仓库 Pages URL 一致（子路径部署时使用 `/blogs/`）。
