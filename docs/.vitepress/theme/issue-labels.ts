export type IssueLabel = { name: string; color: string }

/** 兼容旧数据（字符串数组）与同步脚本写入的 `{ name, color }[]`（color 仅保留，不参与站内样式） */
export function normalizeIssueLabels(raw: unknown): IssueLabel[] {
  if (!Array.isArray(raw)) return []
  const out: IssueLabel[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      const name = item.trim()
      if (name) out.push({ name, color: 'ededed' })
      continue
    }
    if (item && typeof item === 'object' && typeof (item as { name?: unknown }).name === 'string') {
      const o = item as { name: string; color?: string }
      const name = o.name.trim()
      if (!name) continue
      let c = String(o.color ?? '').replace(/^#/, '')
      if (!/^[0-9a-fA-F]{6}$/.test(c)) c = 'ededed'
      out.push({ name, color: c.toLowerCase() })
    }
  }
  return out
}
