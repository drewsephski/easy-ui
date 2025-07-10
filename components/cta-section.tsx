import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, HeartHandshake } from "lucide-react"

export default function CTASection() {
  return (
    <section id="cta">
      <div className="py-10 mt-0 lg:py-20 lg:mt-10">
        <div className="flex overflow-hidden relative flex-col justify-center items-center p-14 w-full">
          <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32">
            <HeartHandshake className="mx-auto text-black size-16 dark:text-white lg:size-24" />
          </div>
          <div className="flex z-10 flex-col items-center mt-4 text-center text-black dark:text-white">
            <h1 className="text-3xl font-bold lg:text-4xl">
              Looking for MVP instead?
            </h1>
            {/* <p className="mt-2">Check Out Easy MVP</p> */}
            <Link
              href="/premium"
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "outline",
                }),
                "px-6 mt-4 group rounded-[2rem]",
              )}
            >
              Check Out Easy MVP
              <ChevronRight className="ml-1 transition-all duration-300 ease-out size-4 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-[70%] dark:to-black" />
        </div>
      </div>
    </section>
  );
}
