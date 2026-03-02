// About page with the same black/orange/white theme
import React from 'react'

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="py-16 bg-black">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">About Ngwavha</h1>
          <p className="text-white/80 mb-8 max-w-3xl">
            Ngwavha is a modern learning platform delivering high-quality courses with a focus on practical outcomes.
            Our mission is to help people build skills, advance careers, and unlock opportunities.
          </p>
        </div>
      </section>
      <section className="py-12 bg-black border-t border-white/10">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-3">Our Mission</h3>
            <p className="text-white/80">
              To empower learners with accessible, engaging, and outcome-driven education. We curate practical content
              and support learners on their journey every step of the way.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-3">Why Ngwavha?</h3>
            <ul className="list-disc pl-6 text-white/80 space-y-2">
              <li>Real-world projects and hands-on practice</li>
              <li>Flexible learning paths and micro-courses</li>
              <li>Engaging instructors and peer support</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
