import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const { userEmail, orderId } = await req.json()

  const ordersPath = path.join(process.cwd(), 'data', 'CustomerOrders.json')
  const ordersData = await fs.readFile(ordersPath, 'utf-8')
  const orders = JSON.parse(ordersData)

  const userOrder = orders.find(
    (order: any) => userEmail === order.Email && order.OrderNumber.includes(orderId)
  )

  if (!userOrder) {
    return NextResponse.json({ orderFound: false })
  }

  return NextResponse.json({
    orderFound: true,
    orderStatus: userOrder.Status,
    trackingLink: userOrder.TrackingNumber
      ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${userOrder.TrackingNumber}`
      : null
  })
}