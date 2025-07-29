"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Smartphone, Clock } from "lucide-react";

const benefits = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Save $19,871+",
    description: "Compared to custom development",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "3.5 Weeks Faster",
    description: "Launch your website in days, not months",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <Check className="w-6 h-6" />,
    title: "No Developer Needed",
    description: "Update content yourself anytime",
    color: "from-blue-500 to-cyan-400"
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile-Perfect",
    description: "Looks amazing on every device",
    color: "from-blue-500 to-cyan-400"
  }
];

const steps = [
  {
    number: "01",
    title: "Choose Your Template",
    description: "Pick from 50+ beautiful, industry-specific designs",
    color: "from-blue-500 to-cyan-400"
  },
  {
    number: "02",
    title: "Customize in Minutes",
    description: "Add your brand, content, and images with our simple editor",
    color: "from-blue-500 to-cyan-400"
  },
  {
    number: "03",
    title: "Go Live Instantly",
    description: "Publish with one click - no technical setup required",
    color: "from-blue-500 to-cyan-400"
  }
];

export default function IntroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span>No technical skills needed</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Your Business, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Online in Minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a professional website that works for your business without the complexity or high costs.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                aria-hidden="true"
              />
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${benefit.color} text-white`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <div className="relative my-16">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-background text-lg font-medium">
              How It Works
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="group relative"
            >
              <div className="relative bg-card border rounded-xl p-6 h-full hover:shadow-md transition-shadow duration-300">
                <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white text-xl font-bold mb-4`}>
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center justify-center space-y-4">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3 text-base font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Get Started Free
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <p className="text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}