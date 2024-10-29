import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface Order {
  CustomerName: string;
  Email: string;
  OrderNumber: string;
  ProductsOrdered: string[];
  Status: string;
  TrackingNumber: string | null;
}

export async function POST(req: Request) {
  const { userEmail, orderId } = await req.json()

  const ordersPath = path.join(process.cwd(), 'data', 'CustomerOrders.json')
  const ordersData = await fs.readFile(ordersPath, 'utf-8')
  const orders = JSON.parse(ordersData)

  const userOrder = orders.find(
    (order: Order) => userEmail === order.Email && order.OrderNumber.includes(orderId)
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