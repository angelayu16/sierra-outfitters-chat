import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { userRequest, conversationHistory } = await req.json();

  // Read the product catalog
  const catalogPath = path.join(process.cwd(), 'data', 'ProductCatalog.json');
  const catalogData = await fs.readFile(catalogPath, 'utf-8');
  const catalog = JSON.parse(catalogData);

  // Here is the previous conversation history:  
  //   <conversation_history>
  //   User:

  //   Assistant:

  //   User:

  //   Assistant:
  //   </conversation_history>

  // Create a structured prompt for OpenAI
  const prompt = `
    You are a recommendation agent for an outdoor retail company called Sierra Outfitters.
    Use the conversation history and user request below to find relevant products from the catalog.

    Conversation History: ${JSON.stringify(conversationHistory)}
    User Request: "${userRequest}"
    Product Catalog: ${JSON.stringify(catalog)}

    Return up to three relevant products in the following format:
    [{"product_name": "name", "product_sku": "sku", "reason": "why it matches"}]

    Make sure to only include product information that's present in the catalog.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const recommendations = JSON.parse(completion.choices[0].message.content ?? 'null') || [];

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}