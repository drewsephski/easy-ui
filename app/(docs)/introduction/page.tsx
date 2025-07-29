// import React from "react"

// function IntroductionPage() {
//   return (
// <div className="flex flex-wrap justify-center gap-4 pb-10 ml-0 lg:ml-10">
//   <div className="w-full p-4 space-y-4 mt-5">
//   <h2 className="text-2xl font-bold">Introduction</h2>
//     <p className="text-lg text-balance text-lg text-muted-foreground">
//       Beautiful collection of 50+ building blocks and website templates.
//     </p>
//     <p className="leading-7 tracking-tight font-[500]">
//       Easy UI is a <b>collection of re-usable 50+ templates</b> and <b>building blocks</b> that you can use into your web apps.
//     </p>
//     <p className="leading-7 tracking-tight font-[500]">It helps you:</p>
//     <ul className="list-disc pl-5 space-y-2 leading-7 tracking-tight font-[500]">
//       <li>✅ Save 100+ hours of work</li>
//     </ul>
//     <h2 className="text-2xl font-bold pt-10">Philosophy</h2>
//     <p>
//       <b>The philosophy behind Easy UI is rooted in simplicity and efficiency. As a developer, I've always believed in the power of good design and user experience.</b> However, I also understand the challenges and time constraints that come with creating visually appealing and functional web applications. That's why I created Easy UI.
//     </p>
//     <p>
//       <b>My goal with Easy UI is to provide a straightforward solution for developers and designers alike. </b>Whether you're working on a personal project, a startup, or for a client, Easy UI offers a foundation that can be easily adapted and customized to fit your needs.
//     </p>
//     <p>
//       <b>It's not just about saving time; it's about maintaining a high standard of quality without the need to reinvent the wheel for every new project.</b>
//     </p>
//     <p>
//       <b>I've focused on making Easy UI as accessible as possible.</b> This means clear documentation, simple configuration, and a community-driven approach to improvements and support. I believe that by sharing resources and tools, we can all achieve more, faster, and with better results.
//     </p>
//     <p>
//       Easy UI templates draw inspiration from many well-regarded templates in the industry.
//     </p>
//   </div>
// </div>
//   )
// }

// export default IntroductionPage

"use client"

import React, { useRef, useState } from "react"
import { CheckCircle2, Clipboard } from "lucide-react"

// @ts-ignore
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-4 top-4 text-slate-400 hover:text-slate-100 transition-colors"
        aria-label="Copy code"
      >
        {copied ? <CheckCircle2 size={20} /> : <Clipboard size={20} />}
      </button>
      <pre className="bg-slate-900 text-slate-50 rounded-lg p-4 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function IntroductionPage() {
  const introRef = useRef(null)
  const installRef = useRef(null)
  const philosophyRef = useRef(null)
  const [highlightedSection, setHighlightedSection] = useState(null)

  // @ts-ignore
  const scrollToSection = (ref, section) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
    setHighlightedSection(section)
    setTimeout(() => setHighlightedSection(null), 2000)
  }

  // @ts-ignore
  const getHighlightClass = (section) =>
    highlightedSection === section
      ? "bg-yellow-100/50 dark:bg-slate-800/50 transition-all duration-1000"
      : ""

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-3">
            <nav className="sticky mt-5 space-y-4 hidden lg:block">
              <h3 className="font-bold text-sm leading-7 tracking-looser text-black dark:text-white">
                Getting Started
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection(introRef, "intro")}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 leading-7 tracking-looser"
                  >
                    Introduction
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(installRef, "install")}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 leading-7 tracking-looser"
                  >
                    Installation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection(philosophyRef, "philosophy")}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 leading-7 tracking-looser"
                  >
                    Philosophy
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="lg:col-span-9">
            <section
              ref={philosophyRef}
              className={`space-y-6 scroll-mt-28 rounded-lg p-0 ${getHighlightClass(
                "philosophy"
              )}`}
            >
              <div className="flex flex-wrap justify-center gap-4 pb-10 ml-0 lg:ml-0">
                <div className="w-full p-0 space-y-6 mt-5" ref={introRef}>
                  <h1 className="text-3xl font-bold text-balance">
                    Your Business, Online in Minutes
                  </h1>
                  <p className="text-xl text-balance text-muted-foreground">
                    No technical skills needed. No expensive developers. Just beautiful, professional websites that work.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <h2 className="text-2xl font-bold mb-4">Why small business owners choose us:</h2>
                    <ul className="space-y-3 text-lg">
                      <li className="flex items-start">
                        <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                        <span>Save $19,871+ compared to custom development</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                        <span>Launch your website 3.5 weeks faster</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                        <span>Update content yourself - no developer needed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                        <span>Mobile-friendly designs that impress customers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border mt-6">
                    <h2 className="text-2xl font-bold mb-4">How it works:</h2>
                    <ol className="space-y-4">
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">1</span>
                        <div>
                          <h3 className="font-semibold">Choose a template</h3>
                          <p className="text-muted-foreground">Pick from 50+ beautiful designs for your industry</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">2</span>
                        <div>
                          <h3 className="font-semibold">Customize in minutes</h3>
                          <p className="text-muted-foreground">Add your photos, text, and colors with our simple editor</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">3</span>
                        <div>
                          <h3 className="font-semibold">Go live today</h3>
                          <p className="text-muted-foreground">Publish with one click - no technical setup required</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                  <h2 className="text-2xl font-bold pt-10">Philosophy</h2>
                  <p>
                    <b>
                      Easy UI is built on the belief that creating a professional online presence should be simple and affordable for every small business owner.
                    </b>{" "}
                    We know you face challenges like high costs and needing specialized tech skills. Easy UI tackles these head-on, giving you the power to build and grow your business online without breaking the bank or needing a tech team.
                  </p>
                  <p>
                    <b>
                      Our goal with Easy UI is to empower small business owners like you.
                    </b>{" "}
                    Whether you're launching a new venture or expanding your existing one, Easy UI provides a simple, powerful platform that adapts to your unique business needs.
                  </p>
                  <p>
                    <b>
                      It's not just about saving time; it's about giving you a high-quality, professional online presence without the headaches of starting from scratch.
                    </b>{" "}
                    Focus on your business, and let Easy UI handle the tech.
                  </p>
                  <p>
                    <b>
                      We've made Easy UI incredibly user-friendly.
                    </b>{" "}
                    This means straightforward tools, easy-to-follow guides, and dedicated support to help you every step of the way. We believe that by sharing resources and tools, we can all achieve more, faster, and with better results.
                  </p>
                  <p>
                    In essence, Easy UI is designed to help your business thrive online.
                    It's about empowering you to bring your vision to life with minimal effort and maximum impact, so you can focus on what you do best: running your business.
                  </p>
                  <p>
                    Easy UI templates are crafted to give your business a professional, modern look that stands out.
                  </p>
                </div>
              </div>
            </section>
            <section
              ref={installRef}
              className={`space-y-6 scroll-mt-28 rounded-lg p-0 ${getHighlightClass(
                "install"
              )}`}
            >
              <h2 className="text-2xl font-bold">Installation</h2>
              <p>
                Follow the steps below to install and configure Easy UI for Next.js:
              </p>
              <ol className="list-decimal pl-5 space-y-2 tracking-tight leading-7">
                <li>
                  <b>Information:</b> This project and all templates are written in <b>TypeScript</b>. We recommend using TypeScript for your project as well.
                </li>
                <li>
                  <b>Download the template:</b> Start by downloading a new Easy UI template.
                </li>
                <li>
                  <b>Install dependencies:</b> Run the following command to install dependencies:
                  <p className="py-2">
                  <CodeBlock>pnpm install</CodeBlock></p>
                </li>
                <li>
                  <b>Run the development server:</b> Start the development server with this command:
                  <p className="py-2">
                  <CodeBlock>pnpm dev</CodeBlock>
                  </p>
                </li>
                <li>
                  <b>View in the browser:</b> Open <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">http://localhost:3000</a> in your browser to see the result.
                </li>
              </ol>
            </section>
            
          </div>
        </div>
      </main>
    </div>
  )
}

export default IntroductionPage
