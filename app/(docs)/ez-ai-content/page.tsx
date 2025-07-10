"use client";

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Icons } from "@/components/icons"
import BuyButton from "@/components/BuyButton"

export default function EzAIContent() {
  const features = [
    "AI-powered content generation",
    "Multiple content types (blog posts, social media, etc.)",
    "Customizable templates",
    "Advanced difficulty",
    "Easy to integrate",
    "Save hours of writing time",
  ]

  const techStack = [
    { name: "Next.js", version: "v14" },
    { name: "React", version: "v18.3" },
    { name: "TypeScript", version: "v5" },
    { name: "TailwindCSS", version: "v3.4" },
    { name: "Framer Motion", version: "v11.3" },
    { name: "next-themes", version: "v0.3" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 lg:max-w-[65%]">
      <Card className="mb-0 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">EZ AI Content</CardTitle>
          <CardDescription className="text-xl">
            Generate AI-powered content easily with this advanced template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video mb-6">
            <img
              src="/ez-ai-content.png"
              alt="EZ AI Content Hero"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="w-full">
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <BuyButton productName="EZ AI Content" />
              </div>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => window.open("https://ez-ai.netlify.app/", "_blank")}
              >
                Live Preview
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Why Should I Use This Template?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This template provides a robust foundation for integrating AI content generation into your Next.js application. It's designed for developers who want to quickly add advanced AI capabilities without building from scratch.
          </p>
          <ul className="list-none space-y-2 mb-4">
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Save countless hours on content creation
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Generate high-quality content with ease
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Fully customizable to fit your needs
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              Advanced features for complex content requirements
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8 border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="font-medium">{tech.name}</span>
                <span className="text-sm text-muted-foreground">{tech.version}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>One-Click Download and Setup: Get started instantly with our easy setup process.</li>
            <li>5 Minutes to Update: Quickly update text and images to match your brand.</li>
            <li>Deploy to Vercel: Easily deploy your site live with Vercel&apos;s seamless integration.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
