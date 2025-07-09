"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function BlogLeadMagnetBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" top-24 rounded-[0.75rem] "
    >
      <Card className="overflow-hidden backdrop-blur-xl rounded-[0.75rem] mr-4 bg-gradient-to-br from-violet-600/90 to-indigo-600/90 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6 space-y-5">
          {/* <div className="flex gap-2 items-center mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/90">Premium Templates</span>
          </div> */}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold tracking-tighter text-center text-white">
              Want to save time? Get beautifully designed website templates with Easy UI Premium.
            </h3>
            <p className="text-center text-white">
              30+ beautiful sections and templates built with React, Typescript, Tailwind CSS, and Framer Motion.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/premium" className="block w-full">
              <Button
                variant="secondary"
                className="w-full bg-white hover:bg-white/90 text-violet-700 font-medium shadow-sm rounded-[1rem]"
              >
                Get Pro
                <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

