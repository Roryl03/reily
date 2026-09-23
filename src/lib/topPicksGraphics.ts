import type { TopPickItem } from '@/lib/topPicks'
import { formatTopPicksMonth } from '@/lib/topPicks'

export type GraphicFormat = 'portrait' | 'story'
export type GraphicType = 'leaderboard' | 'winner'

export function buildLeaderboardGraphicHtml(options: {
  items: TopPickItem[]
  year: number
  month: number
  scopeLabel: string
  format: GraphicFormat
}): string {
  const { items, year, month, scopeLabel, format } = options
  const height = format === 'story' ? 1920 : 1350
  const list = items
    .slice(0, 10)
    .map((item) => `<li>${item.rank}. ${item.service?.name ?? 'Service'}</li>`)
    .join('')

  return `
    <div style="width:1080px;height:${height}px;background:linear-gradient(165deg,#faf9f5 0%,#eef3ea 100%);padding:72px 64px;font-family:Georgia,serif;color:#20332d;box-sizing:border-box;display:flex;flex-direction:column;">
      <div style="font-size:22px;letter-spacing:0.22em;font-weight:700;color:#5a7a5c;">ASK REILLY</div>
      <h1 style="font-size:56px;margin:24px 0 8px;line-height:1.1;">${formatTopPicksMonth(year, month)} Top Picks</h1>
      <p style="font-size:26px;color:#4a5f58;margin:0 0 40px;max-width:880px;">The 10 services most recommended by our community this month — ${scopeLabel}</p>
      <ol style="font-size:30px;line-height:1.55;margin:0;padding-left:36px;flex:1;">${list}</ol>
      <div style="margin-top:auto;padding-top:32px;border-top:1px solid rgba(32,51,45,0.12);">
        <div style="font-size:24px;font-weight:600;">askreillyni.com</div>
        <div style="font-size:22px;color:#5a7a5c;margin-top:8px;">Help make their world bigger.</div>
      </div>
    </div>
  `
}

export function buildWinnerGraphicHtml(options: {
  item: TopPickItem
  year: number
  month: number
  format: GraphicFormat
}): string {
  const { item, year, month, format } = options
  const height = format === 'story' ? 1920 : 1350
  const rankLabel = item.rank === 1 ? '#1' : item.rank <= 3 ? `Top 3 · #${item.rank}` : `Top 10 · #${item.rank}`

  return `
    <div style="width:1080px;height:${height}px;background:linear-gradient(165deg,#faf9f5 0%,#eef3ea 100%);padding:80px 72px;font-family:Georgia,serif;color:#20332d;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;text-align:center;">
      <div style="font-size:20px;letter-spacing:0.24em;font-weight:700;color:#5a7a5c;">ASK REILLY TOP PICK</div>
      <div style="font-size:120px;font-weight:700;margin:32px 0 8px;line-height:1;">${rankLabel}</div>
      <div style="font-size:34px;color:#5a7a5c;margin-bottom:40px;">${formatTopPicksMonth(year, month)}</div>
      <div style="font-size:52px;font-weight:700;line-height:1.15;margin-bottom:32px;">${item.service?.name ?? 'Service'}</div>
      <p style="font-size:28px;color:#4a5f58;max-width:840px;margin:0 auto 48px;">One of the most recommended services on Ask Reilly this month.</p>
      <div style="font-size:24px;font-weight:600;">askreillyni.com</div>
    </div>
  `
}
