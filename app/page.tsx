"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Sparkles } from "lucide-react"
import { Footer } from "react-day-picker"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Announcement } from "@/components/announcement"
import CTASection from "@/components/cta-section"
import { Icons } from "@/components/icons"
import AvatarCircles from "@/components/magicui/avatar-circles"
import FaqPage from "./faqs/page"
import Features from "./features/page"
import OrbitingCirclesDemo from "./integrations/page"
import PricingPage from "./pricing/page"
import MarqueeDemo from "./testimonials/page"
import Showcase from "@/components/showcase"
import EasyHero from "@/components/easy-hero"
import SparkleButton from "@/components/easyui/sparkle-button"
import ShowcaseGrid from "@/components/showcase"
import ROISection from "@/components/ROISection"
import { HoverButton } from "@/components/easyui/hover-button"
// Corrected the path for FAQPage import

export default function IndexPage() {
  const avatarUrls = [
    "https://avatars.githubusercontent.com/u/16860528",
    "https://avatars.githubusercontent.com/u/20110627",
    "https://avatars.githubusercontent.com/u/106103625",
    "https://avatars.githubusercontent.com/u/59228569",
  ]
  return (
    <section id="hero" suppressHydrationWarning>
      <div className="flex flex-col gap-0 items-start px-0 pb-0 mx-auto mt-0 text-center sm:pb-0 md:mt-10 md:items-center md:pb-14 lg:mt-20 lg:pb-14">
        <Announcement />

      <EasyHero title="Starting your Next project ? Don't start from scratch" subtext='Kickstart with 50+ High Quality templates built with Next.js, React, Typescript, Tailwind CSS, and Framer Motion.' />

      {/* Replace the button section with this */}
<div className="px-8 py-5 mx-auto w-full max-w-lg">
  <div className="flex flex-col gap-3 w-full sm:flex-row">
    <div className="flex-1">
      <HoverButton
        href="/template-library"
        className="px-4"
        size="lg"
      >
        Browse Templates
      </HoverButton>
    </div>
    <div className="relative flex-1">
      <Link href="/premium" className="block w-full h-full">
        <SparkleButton
          text="Get Easy UI Premium"
          size="lg"
          variant="outline"
        />
      </Link>
    </div>
  </div>
</div>

        {/* <div className="flex flex-row justify-between items-center p-5 max-w-xl text-base tracking-tight text-left text-black text-balance md:text-center md:text-base dark:font-medium dark:text-white">
          <span className="mr-2 text-gray-600 font-300 dark:text-gray-400 text-md">
            Trusted by
          </span>
          <AvatarCircles numPeople={99} avatarUrls={avatarUrls} />
        </div>         */}
          <motion.div
            className="flex flex-col gap-4 justify-center items-center px-8 mx-auto my-10 md:mb-0 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-lg font-semibold animate-pulse">Featured on</span>
            <div className="flex z-50 gap-4 justify-center items-center">
              <a href="https://sourceforge.net/p/easy-ui/" className="dark:hidden">
                <motion.img
                  alt="Download Easy UI"
                  src="https://sourceforge.net/sflogo.php?type=17&amp;group_id=3785509"
                  width="200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </a>
              <a href="https://sourceforge.net/p/easy-ui/" className="hidden dark:block">
                <motion.img
                  alt="Download Easy UI"
                  src="https://sourceforge.net/sflogo.php?type=18&amp;group_id=3785509"
                  width="200"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </a>
              <a href='https://www.saashub.com/easy-ui-pro?utm_source=badge&utm_campaign=badge&utm_content=easy-ui-pro&badge_variant=color&badge_kind=approved' target='_blank' rel="noreferrer">
                <img src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1" alt="Easy UI Pro badge" style={{ maxWidth: "130px" }} className="ml-5"/>
              </a>
            </div>
          </motion.div>
        <ShowcaseGrid />

        <MarqueeDemo />
      </div>


      <ROISection />
      <div className="lg:pt-20 mx-auto flex max-w-[58rem] flex-col items-center space-y-4 pt-12 text-center sm:pt-8">
        <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-3xl">
          Frequently asked questions
        </h2>
        <p className="max-w-[85%] pb-1 leading-normal text-muted-foreground sm:pb-1 sm:text-lg sm:leading-7 lg:pb-10">
          Get detailed answers to common inquiries.
        </p>
      </div>

      <div className="container my-10 flex max-w-[58rem] flex-col items-center justify-between gap-4 py-0 sm:my-0 md:my-0 lg:my-0">
        <FaqPage />
      </div>
      <CTASection />
      {/* <SiteFooter className="border-t" /> */}

    </section>
  )
}
