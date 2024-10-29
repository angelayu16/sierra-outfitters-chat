import { NextResponse } from 'next/server'
import {v4 as uuidv4} from 'uuid';
import fs from 'fs/promises'
import path from 'path'

export async function POST() {
  const now = new Date()
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const hours = pacificTime.getHours()

  if (hours >= 8 && hours < 10) {
    const promoCode = uuidv4();
    const promoCodesPath = path.join(process.cwd(), 'data', 'PromoCodes.json')
    const promoCodesData = await fs.readFile(promoCodesPath, 'utf-8')
    const promoCodes = JSON.parse(promoCodesData)

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 14)

    const newPromoCode = {
      promoCode,
      promoAmount: 10,
      promoType: 'early_risers',
      start: now,
      end: endDate
    }

    promoCodes.push(newPromoCode)
    await fs.writeFile(promoCodesPath, JSON.stringify(promoCodes, null, 2))

    return NextResponse.json({
      validHours: true,
      promoCode,
      expirationDate: endDate
    })
  }

  return NextResponse.json({ validHours: false })
}