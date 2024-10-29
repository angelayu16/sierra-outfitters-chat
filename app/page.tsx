'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to Sierra Outfitters! How can I help you today? 🏔️🌲" }
  ])
  const [input, setInput] = useState('')
  const [chatActive, setChatActive] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change or typing indicator appears/disappears
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      
      if (data.endChat) {
        setChatActive(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble responding right now. Please try again later." }])
    }
  }

  const startNewChat = () => {
    setMessages([
      { role: 'assistant', content: "Welcome to Sierra Outfitters! How can I help you today? 🏔️🌲" }
    ])
    setInput('')
    setChatActive(true)
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sierra Outfitters Customer Support</h1>
      <ScrollArea ref={scrollAreaRef} className="flex-grow mb-4 p-4 border rounded-md">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-2 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-2 bg-muted">
                <div className="flex space-x-2 items-center h-6">
                  <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {chatActive ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      ) : (
        <div className="flex justify-center">
          <Button onClick={startNewChat} size="lg" className="px-8 py-6 text-lg">
            Start New Chat
          </Button>
        </div>
      )}
    </div>
  )
}