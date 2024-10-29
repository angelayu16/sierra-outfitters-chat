# Sierra Outfitters Customer Support Chat

A Next.js-based customer support chat interface for Sierra Outfitters, featuring AI-powered responses.

## Features

- 🤖 AI-powered chat interface using GPT-4
- 💬 Customer agent that can help with:
  - Order tracking
  - Product recommendations
  - Discount codes
- 🎨 Clean UI using Tailwind CSS and shadcn/ui
- ⚡ Real-time streaming responses

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/angelayu16/sierra-outfitters-chat
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
```

4. Run the development server
```bash
npm run dev
```

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/              # Chat completion endpoint
│   │   ├── order-tracking/    # Order tracking endpoint
│   │   ├── product-recommendation/  # Product recommendation endpoint
│   │   └── promo-code/        # Promo code generation endpoint
│   └── page.tsx               # Main chat interface
├── components/
│   ├── ui/                    # Base UI components
├── data/                      # JSON data files
└── lib/                       # Utility functions and types
```

## API Endpoints

- `/api/chat`: Main chat completion endpoint using OpenAI's GPT-4
- `/api/order-tracking`: Handles order status and tracking information
- `/api/product-recommendation`: Generates product recommendations
- `/api/promo-code`: Generates time-sensitive discount codes

## Technologies Used

- Next.js 14
- OpenAI GPT-4
- Tailwind CSS
- shadcn/ui
- Vercel AI SDK
- TypeScript