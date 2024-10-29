import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `
You are a customer support agent for an outdoor retail company called Sierra Outfitters.

You can help with the following requests:
1. Track an order
2. Give product recommendations
3. Generate an Early Risers discount code
4. End the chat session

Here's what you should do for each of the requests:
1. Ask the user for their email and order number, then call the track order tool.
2. Call the product recommendation tool with the user request.
3. Call the promo code tool. It'll return null if the user requested the discount outside of valid hours, which are 8-10 AM Pacific Time.
4. Call the end chat tool if the user indicates they want to end the chat or says they don't need anything else. Look for phrases like "that's all", "nothing else", "bye", "goodbye", "end chat", etc.

Don't volunteer the types of requests you can help with to the user unless they explicitly ask.

If the user request doesn't fall under one of these categories, tell the user you'll pass their request onto the support team.

Include outdoorsy phrases and emojis in your responses. Be as succinct as possible.

Make sure to ask user if they need help with anything else until they end the chat.
`

export async function POST(req: Request) {
  const { message, history } = await req.json()

  const chatHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message }
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatHistory,
      temperature: 0,
      functions: [
        {
          name: 'handleOrderTracking',
          description: 'Track an order using email and order number',
          parameters: {
            type: 'object',
            properties: {
              userEmail: { type: 'string' },
              orderId: { type: 'string' }
            },
            required: ['userEmail', 'orderId']
          }
        },
        {
          name: 'handleProductRecommendation',
          description: 'Get product recommendations based on user request',
          parameters: {
            type: 'object',
            properties: {
              userRequest: { type: 'string' }
            },
            required: ['userRequest']
          }
        },
        {
          name: 'handlePromoCode',
          description: 'Generate a promo code if within valid hours',
          parameters: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'handleEndChat',
          description: 'End the chat session when user is done',
          parameters: {
            type: 'object',
            properties: {}
          }
        }
      ]
    })

    const assistantMessage = completion.choices[0].message

    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments)

      let functionResult
      switch (functionName) {
        case 'handleOrderTracking':
          functionResult = await fetch('http://localhost:3000/api/order-tracking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(functionArgs)
          }).then(res => res.json())
          break
        case 'handleProductRecommendation':
          functionResult = await fetch('http://localhost:3000/api/product-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(functionArgs)
          }).then(res => res.json())
          break
        case 'handlePromoCode':
          functionResult = await fetch('http://localhost:3000/api/promo-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }).then(res => res.json())
          break
        case 'handleEndChat':
          functionResult = { endChat: true }
          break
        default:
          throw new Error(`Unknown function: ${functionName}`)
      }

      const functionResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          ...chatHistory,
          assistantMessage,
          { role: 'function', name: functionName, content: JSON.stringify(functionResult) }
        ]
      })

      return NextResponse.json({ 
        message: functionResponse.choices[0].message.content,
        endChat: functionName === 'handleEndChat'
      })
    }

    return NextResponse.json({ message: assistantMessage.content })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 })
  }
}