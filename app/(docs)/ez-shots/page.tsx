"use client"

import React from "react"

import { Badge } from "@/components/ui/badge"
import BuyButton from "@/components/BuyButton"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import AdBanner from "@/components/ad-banner"
import Link from "next/link"

function EzShots() {
  return (
<div className="flex flex-wrap gap-4 justify-center px-2 pb-10 min-w-full max-w-full lg:px-20">
     <div className="p-2 mt-3 space-y-4 w-full sm:w-2/3 lg:mt-5 md:lg-5">
        <CardTitle className="text-3xl tracking-tight leading-7">Easy Shots</CardTitle>
        <CardDescription className="text-lg text-balance text-muted-foreground">
          Create Beautiful Images from your Screenshots
        </CardDescription>
        <Badge className="hidden sm:inline-block" variant="default">
          Brought to you by Drew with ❤️
        </Badge>
      </div>

      <div className="lg:min-w-[900px] px-1 lg:px-2 sm:w-1/2 p-1 lg:p-2 ">
        <video muted loop className="w-full h-auto rounded-lg border shadow-2xl lg:border-none lg:rounded-xl" autoPlay>
          <source
            src="https://pub-0cd6f9d4131f4f79ac40219248ae64db.r2.dev/easy-shots.mp4"
            type="video/mp4"
          />
        </video>
      </div>
     <div className="sm:w-1/2 p-1 flex-col flex lg:min-w-[900px]">
        <div className="flex justify-between">
          <div className="w-1/2">
            <BuyButton productName="EZ Shots" />
          </div>
          <Button
            className="px-0 py-4 ml-2 w-1/2 border shadow-sm hover:bg-accent hover:text-accent-foreground"
            variant="outline"
            type="submit"
            onClick={() =>
              window.open("https://easy-shots.vercel.app/", "_blank")
            }
          >
            Live Preview
            <Icons.externalLink className="p-1 ml-1" />{" "}
          </Button>
        </div>

        <div className="flex-col space-y-4 max-w-full lg:min-w-full">
          <h2 className="flex pt-10 min-w-full max-w-full text-2xl font-bold leading-7">
            Why Should I Use This Template?
          </h2>
          <p className="min-w-full max-w-full flex text-md tracking-tight font-[500] leading-7">
            Easily turn screenshots into stunning visuals. Perfect for
            presentations, social media, and marketing. No design skills needed.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-md tracking-tight font-[500] mb-0 lg:pb-2 leading-7">
            <li>✅ Save your time</li>
            <li>✅ No need to learn advanced animations</li>
            <li>✅ Easy to configure and change</li>
            <li>✅ 1-click download and setup</li>
            <li>✅ 5 minutes to update the text and images</li>
            <li>✅ Deploy live to Vercel</li>
          </ul>
          {/* <h3 className="text-2xl font-semibold leading-7">Features</h3>
          <ul className="list-disc pl-5 space-y-2 text-md tracking-tight font-[500] leading-7">
            <li>Header Section</li>
            <li>Hero Section</li>
            <li>Pricing Section</li>
            <li>Call To Action Section</li>
            <li>Footer Section</li>
            <li>Mobile Responsive Navbar</li>
          </ul> */}
          <h3 className="text-2xl font-semibold leading-7">Tech Stack</h3>
          <div className="flex flex-wrap justify-start -m-2 leading-7 dark:text-white">
            <div className="p-2"><Badge className="px-4 py-0 text-base text-white bg-gradient-to-r from-blue-500 to-purple-600">React</Badge></div>
            <div className="p-2"><Badge className="px-4 py-0 text-base text-white bg-gradient-to-r from-green-500 to-blue-600">Next.js</Badge></div>
            <div className="p-2"><Badge className="px-4 py-0 text-base text-white bg-gradient-to-r from-pink-500 to-orange-500">Tailwind CSS</Badge></div>
            <div className="p-2"><Badge className="px-4 py-0 text-base text-white bg-gradient-to-r from-gray-500 to-gray-700">Framer Motion</Badge></div>
            <div className="p-2"><Badge className="px-4 py-0 text-base text-white bg-gradient-to-r from-gray-500 to-gray-700">Vercel</Badge></div>
          </div>
          <h3 className="text-2xl font-semibold leading-7">Quick Setup</h3>
          <ul className="list-disc pl-5 space-y-2 text-md tracking-tight font-[500] leading-7">
            <li>
              1-Click Download and Setup: Get started instantly with our easy
              setup process.
            </li>
            <li>
              5 Minutes to Update: Quickly update text and images to match your
              brand.
            </li>
            <li>
              Deploy to Vercel: Easily deploy your site live with Vercel’s
              seamless integration.
            </li>
          </ul>
          <p className="pt-0 tracking-tight leading-7 lg:pt-5">
            Get started today and bring your website to life with minimal effort
            and maximum impact!
          </p>
        </div>
      </div>
    </div>
  )
}

export default EzShots
