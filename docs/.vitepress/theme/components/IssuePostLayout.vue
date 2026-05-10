<script setup lang="ts">
import { computed } from 'vue'
import { Content, useData } from 'vitepress/client'
import { normalizeIssueLabels, labelTextColor } from '../issue-labels'

const { frontmatter } = useData()

const labels = computed(() => normalizeIssueLabels(frontmatter.labels))
</script>

<template>
  <div class="issue-post">
    <!-- 在此增加页眉、面包屑、TOC、广告等；正文由 Content 渲染 -->
    <p v-if="frontmatter.issueUrl" class="issue-post__source">
      <a :href="String(frontmatter.issueUrl)" target="_blank" rel="noreferrer noopener">去 GitHub 上查看评论</a>
    </p>
    <ul v-if="labels.length" class="issue-post-labels" aria-label="GitHub 标签">
      <li v-for="lb in labels" :key="lb.name" class="issue-post-label-item">
        <span
          class="issue-post-label"
          :style="{ backgroundColor: `#${lb.color}`, color: labelTextColor(lb.color) }"
          >{{ lb.name }}</span
        >
      </li>
    </ul>
    <Content />
  </div>
</template>
