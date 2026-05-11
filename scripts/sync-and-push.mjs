#!/usr/bin/env node
/**
 * 运行 content:sync，若有变更则 git commit 并 push。
 * 用法: pnpm content:sync:push
 */
import { execSync } from 'node:child_process'
import process from 'node:process'

function run(cmd) {
  console.log(`\n> ${cmd}\n`)
  execSync(cmd, { stdio: 'inherit', shell: true })
}

/** @returns {boolean} true 表示暂存区与 HEAD 无差异（无需 commit） */
function isStagedClean() {
  try {
    execSync('git diff --staged --quiet', { stdio: 'ignore', shell: true })
    return true
  } catch {
    return false
  }
}

run('pnpm content:sync')
run('git add -A')

if (isStagedClean()) {
  console.log('\n无变更，跳过 commit / push。\n')
  process.exit(0)
}

run('git commit -m "sync content"')
run('git push')
console.log('\n已完成同步并推送。\n')
