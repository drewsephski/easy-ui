// "use client"

// import * as React from "react"
// import Link from "next/link"
// import { usePathname } from "next/navigation"

// import { siteConfig } from "@/config/site"
// import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons"
// import { Badge } from "./ui/badge"

// export function MainNav() {
//   const pathname = usePathname()

//   const isActive = (path: string) => pathname === path || pathname.startsWith(path)

//   return (
//     <div className="mr-4 md:flex">
//       <Link href="/" className="flex items-center mr-6 space-x-2">
//         <img src="https://pub-0cd6f9d4131f4f79ac40219248ae64db.r2.dev/logo.svg" className="size-7" alt="Logo" />
//         <span className="font-bold sm:inline-block">
//           {siteConfig.name}
//         </span>
//         <Badge className="hidden text-white bg-black rounded-full sm:inline-block dark:bg-white dark:text-black" variant="secondary">Beta</Badge>
//       </Link>
//       <nav className="hidden text-sm lg:flex lg:items-center lg:gap-6">
//         <Link
//           href="/template-library"
//           className={cn(
//             isActive("/template-library") ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80"
//           )}
//         >
//           Templates
//         </Link>
//         <Link
//           href="/component"
//           className={cn(
//             isActive("/component") ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80"
//           )}
//         >
//           Components
//         </Link>
//         <Link
//           href="/easy-mvp-pricing"
//           className={cn(
//             isActive("/easy-mvp-pricing") ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80"
//           )}
//         >
//           Pricing
//         </Link>

//         {/* <Link
//           href={siteConfig.links.github}
//           className={cn(
//             isActive(siteConfig.links.github) ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80 flex items-center"
//           )}
//         >
//           GitHub <Icons.externalLink className="ml-2 size-4" />
//         </Link> */}
//         <Link
//           href="https://premium.easyui.pro/"
//           className={cn(
//             isActive("https://premium.easyui.pro/") ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80 flex items-center"
//           )}
//         >
//           Premium Templates <Icons.externalLink className="ml-2 size-4" />
//         </Link>
//         {/* <Link
//           href="https://mvp.easyui.pro/"
//           className={cn(
//             isActive("https://mvp.easyui.pro/") ? "text-foreground" : "text-foreground/60",
//             "transition-colors hover:text-foreground/80 flex items-center"
//           )}
//         >
//           Easy MVP <Icons.externalLink className="ml-2 size-4" />
//         </Link> */}
//       </nav>
//     </div>
//   )
// }



"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Badge } from "./ui/badge"

export function MainNav() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href)

  return (
    <div className="mr-4 md:flex">
      <Link href="/" className="flex items-center mr-6 space-x-2">
        <img src="https://pub-0cd6f9d4131f4f79ac40219248ae64db.r2.dev/logo.svg" className="size-7" alt="Logo" />
        <span className="font-bold sm:inline-block">
          {siteConfig.name}
        </span>
        <Badge className="hidden text-white bg-black rounded-full sm:inline-block dark:bg-white dark:text-black" variant="secondary">Beta</Badge>
      </Link>
      <nav className="hidden text-sm lg:flex lg:items-center lg:gap-6">
        <Link
          href="/template-library"
          className={cn(
            "relative py-1 transition-colors hover:text-foreground/80",
            isActive("/template-library")
              ? "font-medium text-foreground"
              : "text-foreground/60"
          )}
        >
          Templates
          {isActive("/template-library") && (
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
          )}
        </Link>
        <Link
          href="/component"
          className={cn(
            "relative py-1 transition-colors hover:text-foreground/80",
            isActive("/component")
              ? "font-medium text-foreground"
              : "text-foreground/60"
          )}
        >
          Components
          {isActive("/component") && (
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
          )}
        </Link>
        <Link
          href="/easy-mvp-pricing"
          className={cn(
            "relative py-1 transition-colors hover:text-foreground/80",
            isActive("/easy-mvp-pricing")
              ? "font-medium text-foreground"
              : "text-foreground/60"
          )}
        >
          Pricing
          {isActive("/easy-mvp-pricing") && (
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
          )}
        </Link>
        <Link
          href="/premium"
          className={cn(
            "relative py-1 transition-colors hover:text-foreground/80",
            isActive("/premium")
              ? "font-medium text-foreground"
              : "text-foreground/60"
          )}
        >
          Premium
          {isActive("/premium") && (
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
          )}
        </Link>
        <Link
          href="/template-builder"
          className={cn(
            "relative py-1 transition-colors hover:text-foreground/80",
            isActive("/template-builder")
              ? "font-medium text-foreground"
              : "text-foreground/60"
          )}
        >
          Builder
          {isActive("/template-builder") && (
            <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
          )}
        </Link>
      </nav>
    </div>
  )
}

