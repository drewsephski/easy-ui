// "use client"

// import Link from "next/link"
// import { CheckIcon, ChevronRight, ChevronRightIcon } from "lucide-react"

// import { siteConfig } from "@/config/site"
// import { Button, buttonVariants } from "@/components/ui/button"
// import { Icons } from "@/components/icons"
// import { MainNav } from "@/components/main-nav"
// import { ThemeToggle } from "@/components/theme-toggle"

// import { AnimatedSubscribeButton } from "./magicui/animated-subscribe-button"
// import { cn } from "@/lib/utils"

// export function SiteHeader() {
//   return (
//     <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1">
//       <div className="container flex items-center max-w-screen-2xl h-14">
//         <MainNav />
//         <div className="flex flex-1 justify-end items-center space-x-4">
//           <nav className="flex items-center space-x-2">
//             <div className="hidden sm:block lg:block">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() =>
//                   window.open(
//                     "https://discord.gg/7yTP7KGK",
//                     "_blank"
//                   )
//                 }
//               >
//                 <Icons.discord
//                   width="23"
//                   height={23}
//                   className="text-gray-500 dark:text-gray-600"
//                 />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() =>
//                   window.open(
//                     "https://github.com/DarkInventor/easy-ui",
//                     "_blank"
//                   )
//                 }
//               >
//                 <Icons.github
//                   width="20"
//                   className="text-gray-500 dark:text-gray-600"
//             <a
//               href="https://premium.easyui.pro/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className={cn(
//                 buttonVariants({
//                   variant: "default",
//                   size: "sm",
//                 }),
//                 "gap-2 whitespace-pre md:flex",
//                 "relative text-sm font-semibold transition-all duration-150 ease-in-out group ring-offset-inherit hover:ring-2 hover:ring-black hover:ring-offset-2 hover:ring-offset-current dark:hover:ring-neutral-50"
//               )}
//             >
//               Get Easy UI Premium
//               <ChevronRight className="ml-1 transition-all duration-300 ease-out size-4 shrink-0 group-hover:translate-x-1" />
//             </a>
//             {/* } */}
//             {/* changeText={
//                 <a className="inline-flex items-center group" href="/login">
//                 Login{" "}
//                 <ChevronRightIcon className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
//               </a>
//               }
//             /> */}
//           </nav>
//         </div>
//       </div>
//     </header>
//   )
// }

"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  CheckIcon,
  ChevronRight,
  ChevronRightIcon,
  Menu,
  X,
} from "lucide-react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

import { AnimatedSubscribeButton } from "./magicui/animated-subscribe-button"
import { Badge } from "./ui/badge"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1">
      <div className="container flex items-center max-w-screen-2xl h-14">
        {/* Hamburger menu for small and medium screens */}
        <button className="mr-4 lg:hidden" onClick={toggleMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 lucide lucide-panel-left-open"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
        </button>

        {/* Logo for large screens */}
        {/* <Link href="/" className="hidden items-center space-x-2 lg:flex">
          <Icons.logo />
          <span className="font-bold">{siteConfig.name}</span>
        </Link> */}

        {/* Main navigation for large screens */}
        <div className="hidden lg:block">
          <MainNav />
        </div>

        {/* Right-side content */}
        <div className="flex flex-1 justify-end items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <div className="hidden items-center space-x-2 lg:flex">
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.open("https://discord.gg/9PZpwYXA", "_blank")
                }
              >
                <Icons.discord
                  width="23"
                  height={23}
                  className="text-gray-500 dark:text-gray-600"
                />
              </Button> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.open(
                    "https://github.com/drewsephski",
                    "_blank"
                  )
                }
              >
                <Icons.github
                  width="20"
                  className="text-gray-500 dark:text-gray-600"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.open("https://instagram.com/drew.sepeczi", "_blank")
                }
              >
                <Icons.instagram
                  width="20"
                  className="text-gray-500 dark:text-gray-600"
                />
              </Button>
              <ThemeToggle />
            </div>
            <Link
              href="/premium"
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "sm",
                }),
                "gap-2 whitespace-pre md:flex",
                "relative text-sm font-semibold transition-all duration-150 ease-in-out group ring-offset-inherit hover:ring-2 hover:ring-black hover:ring-offset-2 hover:ring-offset-current dark:hover:ring-neutral-50"
              )}
            >
              Get Easy UI Premium
              <ChevronRight className="ml-1 transition-all duration-300 ease-out size-4 shrink-0 group-hover:translate-x-1" />
            </Link>
          </nav>
        </div>
      </div>

      {/* Side menu for small and medium screens */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-black dark:bg-black dark:text-white  transform z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex flex-col p-0 py-6 h-full z-60">
          <div className="flex justify-between items-center m-2 mb-0 z-60">
            <Link href="/" className="flex items-center mr-6 space-x-2">
              <img
                src="https://pub-0cd6f9d4131f4f79ac40219248ae64db.r2.dev/logo.svg"
                className="size-7"
                alt="Logo"
              />
              <span className="font-bold sm:inline-block">
                {siteConfig.name}
              </span>
              <Badge className="hidden sm:inline-block" variant="secondary">
                Beta
              </Badge>
            </Link>
            <button onClick={toggleMenu}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col py-10 pl-4 ml-0 space-y-4 text-black bg-white dark:bg-black dark:text-white z-60">
            <Link href="/" className="text-sm text-foreground hover:text-foreground/80">
              Home
            </Link>
            <Link
              href="/templates"
              className="text-sm text-foreground hover:text-foreground/80"
            >
              Templates
            </Link>
            <Link
              href="/component"
              className="text-sm text-foreground hover:text-foreground/80"
            >
              Components
            </Link>
            <Link
              href="/easy-mvp-pricing"
              className="text-sm text-foreground hover:text-foreground/80"
            >
              Pricing
            </Link>
            <Link href="/premium" target="_blank" className="inline-flex items-center text-sm text-foreground hover:text-foreground/80">Premium Templates<Icons.externalLink className="ml-2 size-4" /></Link>
            <Link href="/easy-mvp-pricing" target="_blank" className="inline-flex items-center text-sm text-foreground hover:text-foreground/80">Easy MVP<Icons.externalLink className="ml-2 size-4" /></Link>

          <p className="flex flex-col mt-auto space-y-4 text-xs font-semibold tracking-tight leading-7 bg-white text-muted-foreground dark:text-gray-400 dark:bg-black z-60"> Socials</p>
            {/* <Button
              variant="ghost"
              onClick={() =>
                window.open("https://discord.gg/9PZpwYXA", "_blank")
              }
              className="flex items-start justify-start !px-0 !h-4 "
            >
              <Icons.discord className="mr-2 w-4 h-4" />
              Discord
            </Button> */}
            <Link href="/pricing" className="flex items-center px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground/80">
              <Icons.github className="mr-2 w-4 h-4" />
              Pricing
            </Link>
            <Button
              variant="ghost"
              onClick={() =>
                window.open("https://instagram.com/drew.sepeczi", "_blank")
              }
              className="flex items-start justify-start !px-0 !h-4 border-b pb-20"
            >
              <Icons.instagram className="mr-2 w-4 h-4" />
              Instagram
            </Button>
            <div className="flex justify-center pb-4 mt-10 rounded-lg border-gray-200 dark:border-gray-700">
              <ThemeToggle />
            </div>
          {/* </div> */}
          </nav>
        </div>
      </div>
    </header>
  )
}
