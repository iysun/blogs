<script setup lang="ts">
import { computed } from "vue";
import { Content, useData, withBase } from "vitepress/client";
import issueNav from "../../data/issue-nav.json";
import { normalizeIssueLabels, labelTextColor } from "../issue-labels";

type NavEntry = { issue: number; path: string; title: string };

const { frontmatter } = useData();

const labels = computed(() =>
  normalizeIssueLabels(frontmatter.value.labels || []),
);

const pager = computed(() => {
  const issue = frontmatter.value.issue;
  if (issue == null || issue === "")
    return { prev: null as NavEntry | null, next: null as NavEntry | null };
  const key = String(issue);
  const by = (
    issueNav as {
      byIssue?: Record<
        string,
        { prev: NavEntry | null; next: NavEntry | null }
      >;
    }
  ).byIssue;
  const row = by?.[key];
  return {
    prev: row?.prev ?? null,
    next: row?.next ?? null,
  };
});

const showFooter = computed(
  () => pager.value.prev != null || pager.value.next != null,
);
</script>

<template>
  <div class="issue-post">
    <!-- 在此增加页眉、面包屑、TOC、广告等；正文由 Content 渲染 -->
    <p v-if="frontmatter.issueUrl" class="issue-post__source">
      <a
        :href="String(frontmatter.issueUrl)"
        target="_blank"
        rel="noreferrer noopener"
        >去 GitHub 上查看评论</a
      >
    </p>
    <Content />
    <ul v-if="labels.length" class="issue-post-labels" aria-label="GitHub 标签">
      <li v-for="lb in labels" :key="lb.name" class="issue-post-label-item">
        <span
          class="issue-post-label"
          :style="{
            backgroundColor: `#${lb.color}`,
            color: labelTextColor(lb.color),
          }"
          >{{ lb.name }}</span
        >
      </li>
    </ul>
  </div>
  <footer v-if="showFooter" class="issue-post-footer">
    <a
      v-if="pager.prev"
      :href="withBase(pager.prev.path)"
      class="issue-post-pager issue-post-pager--prev"
    >
      <span class="issue-post-pager__dir">上一篇</span>
      <span class="issue-post-pager__title">{{ pager.prev.title }}</span>
    </a>
    <span
      v-else
      class="issue-post-pager issue-post-pager--empty"
      aria-hidden="true"
    />
    <a
      v-if="pager.next"
      :href="withBase(pager.next.path)"
      class="issue-post-pager issue-post-pager--next"
    >
      <span class="issue-post-pager__dir">下一篇</span>
      <span class="issue-post-pager__title">{{ pager.next.title }}</span>
    </a>
    <span
      v-else
      class="issue-post-pager issue-post-pager--empty"
      aria-hidden="true"
    />
  </footer>
</template>
