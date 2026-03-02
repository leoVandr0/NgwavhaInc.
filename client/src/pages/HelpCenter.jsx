// Help Center with FAQs in the same dark theme
import React from 'react'

const HelpCenter = () => {
  const faqs = [
    { q: 'How do I enroll in a course?', a: 'Browse the catalog and click Enroll on the course you want.' },
    { q: 'I forgot my password. What should I do?', a: 'Use the Forgot Password link on the login page to reset.' },
    { q: 'How do I get support?', a: 'Use the Contact form in this Help Center or reach out via email.' },
  ]
  return (
    <section className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-white/80 mb-8">Find answers to common questions and get help quickly.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {faqs.map((f, idx) => (
              <details key={idx} className="mb-4 bg-black/70 p-4 border border-white/10 rounded-md">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-white/70">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="bg-black/70 border border-white/10 p-4 rounded-md">
            <h3 className="text-xl font-semibold mb-3">Need more help?</h3>
            <p>Reach out via the Contact page and we’ll respond shortly.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HelpCenter
