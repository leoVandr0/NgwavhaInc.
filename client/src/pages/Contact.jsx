// Contact page with the same dark theme
import React, { useState } from 'react'
import { Input, Button, message } from 'antd'

const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !messageBody) {
      message.error('Please fill in name, email, and message')
      return
    }
    // In a real app you’d POST to /api/contact. Here we simulate a success toast
    message.success('Thanks! Your message has been received. We’ll get back to you soon.')
    setName('')
    setEmail('')
    setSubject('')
    setMessageBody('')
  }

  return (
    <section className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-white/80 mb-8">We’d love to hear from you. Send us a message and we’ll respond quickly.</p>

        <form onSubmit={onSubmit} className="bg-black/70 p-6 rounded-md border border-white/10 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Message</label>
            <textarea className="w-full p-2 bg-black text-white border border-white/20" rows={6} placeholder="Your message" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
          </div>
          <Button type="primary" htmlType="submit">Send Message</Button>
        </form>
      </div>
    </section>
  )
}

export default Contact
