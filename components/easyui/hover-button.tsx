"use client"

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link, { LinkProps } from "next/link"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface HoverButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const HoverButton = forwardRef<HTMLButtonElement, HoverButtonProps>(
  ({ className, children, href, variant = "default", size = "default", ...props }, ref) => {
    const buttonClasses = cn(
      "relative overflow-hidden group px-6 py-2.5 font-medium text-sm rounded-full transition-all duration-300 ease-out",
      "bg-gradient-to-r from-blue-600 to-slate-700 text-white",
      "hover:from-blue-700 hover:to-slate-800 hover:shadow-lg hover:shadow-blue-500/20",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white",
      "inline-flex items-center justify-center whitespace-nowrap",
      "border border-blue-500/20",
      {
        "h-9 px-4 text-sm": size === "sm",
        "h-11 px-6 text-base": size === "lg",
        "h-10 w-10 p-0": size === "icon",
      },
      className
    )

    const content = (
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
        <ChevronRight className="ml-1 size-4" />
      </span>
    )

    if (href) {
      // Remove href from props to avoid duplicate
      const { href: _, ...restProps } = props as LinkProps & { href: string }
      return (
        <Link
          href={href}
          className={buttonClasses}
          {...restProps}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        {...props}
      >
        {content}
      </button>
    )
  }
)

HoverButton.displayName = "HoverButton"

export { HoverButton }
