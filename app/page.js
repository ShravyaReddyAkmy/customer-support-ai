'use client'
import Image from 'next/image';
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect, React } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the AI assistant for e-Books. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Send the message to the server
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return; // Dont send empty messages
    setIsLoading(true)
    
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
    
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
    
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
    
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))',
          zIndex: 1,
        },
      }}
    >
      <Image
        fill
        src="/image2-book-cover.avif"  // Replace with your image path
        alt="Background Image"
        style={{ objectFit: 'cover' }}
      />
      <Box
        sx={{
          zIndex: 2,
          width: '80%',
          height: '80%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
          e-Books Customer Assistance
        </Typography>
        
        <Stack
          direction="column"
          width="100%"
          height="100%"
          border="1px solid black"
          p={2}
          spacing={3}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: Add a semi-transparent background to the chat box
            backdropFilter: 'blur(5px)', // Optional: Add a blur effect to the background
            overflowY: 'auto',
          }}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                    ? '#8B4513' // Brown shade for assistant messages
                    : '#b26500' // Lighter brown shade for user messages
                  }
                  color="white"
                  borderRadius={3}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyUp={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#8B4513', // Brown border color for the TextField
                  },
                  '&:hover fieldset': {
                    borderColor: '#b26500', // Darker brown on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#b26500', // Lighter brown when focused
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8B4513', // Brown color for the label
                  '&.Mui-focused': {
                    color: '#b26500', // Lighter brown when focused
                  },
                },
              }}
            />
            <Button variant="contained" 
              onClick={sendMessage} 
              disabled={isLoading}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': {
                  backgroundColor: '#b26500', // A darker shade of brown for the hover state
                },
              }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  
  )
}
