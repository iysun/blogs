export type IssueLabel = { name: string; color: string }

/** 兼容旧数据（字符串数组）与同步脚本写入的 `{ name, color }[]` */
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

/** 根据 GitHub label 背景色（6 位 hex，无 #）选择对比度足够的文字色 */
export function labelTextColor(bgHexNoHash: string): string {
  const h = bgHexNoHash.replace(/^#/, '')
  if (h.length !== 6) return '#24292f'
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return L > 0.55 ? '#24292f' : '#ffffff'
}
