"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Crown,
  LayoutTemplate,
  Puzzle,
  SparklesIcon,
  Wand,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import FlipLink from "@/components/ui/text-effect-flipper"

export function SiteFooterNew() {
  return (
    <section className="mx-auto my-12 w-full max-w-4xl rounded-[24px] border border-black/5 p-2 shadow-sm dark:border-white/5 md:rounded-t-[44px]">
      <div className="relative mx-auto w-full rounded-[24px] border border-black/5 bg-neutral-800/5 shadow-sm dark:border-white/5 md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px]">
        <article className="flex z-50 flex-col justify-center items-center mt-20">
          <Badge
            variant="outline"
            className="mb-3 rounded-[14px] border border-black/10 bg-white text-base dark:border-white/5 dark:bg-neutral-800/5 md:left-6"
          >
            <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800" />{" "}
            Easy UI
          </Badge>
        </article>
        <section className="h-full">
          <section className="grid gap-2 place-content-center px-8 py-24 text-black">
            <div className="flex justify-center items-center group">
              <div className="mr-4 rounded-lg bg-[#D9D9D9] p-4 transition-all duration-500 ease-in-out group-hover:bg-accent">
                <LayoutTemplate className="w-10 h-10 text-black transition-all duration-500 ease-in-out group-hover:text-white" />
              </div>
              <FlipLink href="/templates">Templates</FlipLink>
            </div>
            <div className="flex justify-center items-center group">
              <FlipLink href="/component">Components</FlipLink>
              <div className="ml-4 rounded-lg bg-[#D9D9D9] p-4 transition-all duration-500 ease-in-out group-hover:bg-accent">
                <Puzzle className="w-10 h-10 text-black transition-all duration-500 ease-in-out group-hover:text-white" />
              </div>
            </div>
            <div className="flex justify-center items-center group">
              <div className="mr-4 rounded-lg bg-[#D9D9D9] p-4 transition-all duration-500 ease-in-out group-hover:bg-accent">
                <Crown className="w-10 h-10 text-black transition-all duration-500 ease-in-out group-hover:text-white" />
              </div>
              <FlipLink href="/premium">Premium</FlipLink>
            </div>
            <div className="flex justify-center items-center group">
              <FlipLink href="/template-builder">Builder</FlipLink>
              <div className="ml-4 rounded-lg bg-[#D9D9D9] p-4 transition-all duration-500 ease-in-out group-hover:bg-accent">
                <Wand className="w-10 h-10 text-black transition-all duration-500 ease-in-out group-hover:text-white" />
              </div>
            </div>
          </section>
        </section>
      </div>
    </section>
  )
}
