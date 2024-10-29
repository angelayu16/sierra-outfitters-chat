import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST() {
  const now = new Date()
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const hours = pacificTime.getHours()

  if (hours >= 8 && hours < 10) {
    const promoCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const promoCodesPath = path.join(process.cwd(), 'data', 'PromoCodes.json')
    const promoCodesData = await fs.readFile(promoCodesPath, 'utf-8')
    const promoCodes = JSON.parse(promoCodesData)

    const newPromoCode = {
      promoCode,
      promoAmount: 10,
      promoType: 'early_risers',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
    }

    promoCodes.push(newPromoCode)
    await fs.writeFile(promoCodesPath, JSON.stringify(promoCodes, null, 2))

    return NextResponse.json({ validHours: true, promoCode })
  }

  return NextResponse.json({ validHours: false })
}