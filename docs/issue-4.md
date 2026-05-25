---
title: "[git] git worktree"
date: 2026-05-17
issue: 4
issueUrl: "https://github.com/iysun/blogs/issues/4"
readingTime: 3
labels: []
syncedFromIssue: true
layout: IssuePostLayout
pageClass: blog-doc
---

我在工作中经常需要在同一个项目的不同分支上写代码， 使用 git worktree 实际上可以让我不用总是切换分支
## git worktree 怎么用
### 1. **创建新的工作树**
```plain
git worktree add <路径> <分支>
```

+ 创建一个新的工作树并将指定分支检出到该工作树中。例如：

```plain
git worktree add ../my-feature-branch feature-branch
```

+ 这会在当前仓库目录外的 `../my-feature-branch` 目录中创建一个新的工作树，并将 `feature-branch` 分支检出。

### 2. **移除工作树**
```plain
git worktree remove <路径>
```

+ 移除指定路径的工作树。例如：

```plain
git worktree remove -f ../my-feature-branch
```

+ 这会删除 `../my-feature-branch` 工作树，注意工作树内的修改不会丢失，仓库本身的数据不会受影响。

### 3. **列出所有工作树**
```plain
git worktree list
```

+ 显示当前仓库的所有工作树及其状态。

### 4. **清理孤立的工作树**
```plain
git worktree prune
```

+ 删除所有已被移除的工作树，清理磁盘空间。
