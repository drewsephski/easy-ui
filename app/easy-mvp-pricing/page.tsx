// 'use client'

// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { CheckCircle2 } from 'lucide-react'

// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"

// const pricingPlans = [
//   {
//     name: "Components",
//     subtitle: "Coming Soon",
//     price: null,
//     description:
//       "Standalone components tailored to your needs and easily integrated. Perfect for website elements or sections.",
//     features: [
//       "As many components in a month",
//       "React / Next.js / Tailwind CSS code",
//       "Design + Development",
//       "Unlimited Revisions",
//       "24-hour support response time",
//       "Private communication channel",
//       "4-7 days turnaround time",
//       "Pause or cancel anytime",
//     ],
//     ctaText: "Coming Soon",
//     featured: false,
//     comingSoon: true,
//   },
//   {
//     name: "Pages",
//     subtitle: "pause or cancel anytime",
//     price: 1887,
//     description:
//       "Best for early-stage startups and businesses that need a marketing side and ongoing developmental work.",
//     features: [
//       "One request / page at a time",
//       "React / Next.js / Tailwind CSS code",
//       "Design + Development",
//       "Unlimited Revisions",
//       "CMS integration",
//       "Search Engine Optimization",
//       "24-hour support response time",
//       "Private communication channel",
//       "7-10 days turnaround time",
//       "Pause or cancel anytime",
//     ],
//     ctaText: "Buy Now",
//     featured: false,
//     url: 'https://tally.so/r/mZVbby',
//   },
//   {
//     name: "Multi Page Website",
//     subtitle: "starts at",
//     price: 4887,
//     description:
//       "Best for small businesses and startups that need a performant website that looks great and converts visitors to customers.",
//     features: [
//       "Multi-page landing page website",
//       "Web Apps and SaaS Development",
//       "AI Apps development",
//       "Design + Development",
//       "24-hour support response time",
//       "Private communication channel",
//       "Unlimited Revisions",
//       "Negotiable delivery time",
//     ],
//     ctaText: "Buy Now",
//     featured: true,
//     url: 'https://tally.so/r/3jLkMx',
//   },
// ]

// export default function PricingSection() {
//   const router = useRouter()

//   const handleClick = (url: string) => {
//     if (url) {
//       router.push(url)
//     }
//   }

//   return (
//     <section className="container px-4 py-7 mx-auto max-w-6xl tracking-tight leading-7 sm:px-6 md:px-8">
//       <div className="mb-12 text-center">
//         <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
//           Simple pricing for<br className="hidden sm:block" /> everyone.
//         </h1>
//         <p className="mx-auto max-w-4xl text-lg sm:text-xl text-muted-foreground">
//           Choose an <span className="font-semibold text-foreground">affordable plan</span> that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-6 tracking-tight leading-7 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan) => (
//           <Card
//             key={plan.name}
//             className={`relative p-6 sm:p-8 rounded-3xl border-[1.5px] leading-7 tracking-tight cursor-pointer ${
//               plan.featured
//                 ? "bg-gradient-to-b from-black to-gray-900 ring-offset-inherit transition-all duration-150 ease-in-out hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background text-white"
//                 : "bg-white dark:bg-black text-black dark:text-white"
//             } border-gray-200 dark:border-gray-800`}
//           >
//             <h3 className="mb-2 text-xl font-bold tracking-tight leading-7 sm:text-2xl">{plan.name}</h3>
//             <p className="mb-6 text-sm tracking-tight leading-7 sm:text-base text-muted-foreground">
//               {plan.subtitle}
//             </p>

//             {plan.comingSoon ? (
//               <div className="mb-6 tracking-tight leading-7">
//                 <span className="text-3xl font-bold tracking-tight leading-none sm:text-4xl md:text-5xl">
//                   Coming Soon
//                 </span>
//               </div>
//             ) : (
//               <div className="mb-6 tracking-tight leading-7">
//                 <div className="flex items-baseline tracking-tight leading-7">
//                   <span className="text-3xl font-bold tracking-tight leading-none sm:text-4xl md:text-5xl">$</span>
//                   <span className="text-3xl font-bold tracking-tight leading-none sm:text-4xl md:text-5xl">
//                     {plan.price}
//                   </span>
//                   <span className="ml-2 text-lg tracking-tight leading-7 sm:text-xl text-muted-foreground">
//                     /mo
//                   </span>
//                 </div>
//               </div>
//             )}

//             <p
//               className="mb-8 text-base tracking-tight leading-normal sm:text-lg"
//             >
//               {plan.description}
//             </p>

//             <Button
//               className={`w-full rounded-full py-4 sm:py-5 text-base sm:text-lg font-medium mb-8 leading-7 tracking-tight ${
//                 plan.featured
//                   ? "bg-white text-black hover:bg-gray-100 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
//                   : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100"
//               }`}
//               disabled={plan.comingSoon}
//               onClick={() => handleClick(plan.url)}
//             >
//               {plan.ctaText}
//             </Button>

//             <ul className="space-y-4 tracking-tight leading-7">
//               {plan.features.map((feature) => (
//                 <li key={feature} className="flex gap-3 items-center tracking-tight leading-7">
//                   <div className="flex flex-shrink-0 justify-center items-center w-6 h-6 tracking-tight leading-7 bg-emerald-100 rounded-full dark:bg-emerald-900">
//                     <CheckCircle2 className="w-5 h-5 tracking-tight leading-7 text-emerald-500 dark:text-emerald-400" />
//                   </div>
//                   <span className="text-base tracking-tight leading-7 sm:text-lg">
//                     {feature}
//                   </span>
//                 </li>
//               ))}
//             </ul>

//             <div className="mt-4 tracking-tight leading-7 text-center sm:mt-6">
//               <Link
//                 href="#"
//                 className="text-sm tracking-tight leading-7 sm:text-base text-muted-foreground hover:text-foreground"
//               >
//                 Questions?
//               </Link>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </section>
//   )
// }


'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const pricingPlans = [
  {
    name: "Components",
    subtitle: "Coming Soon",
    price: null,
    description:
      "Standalone components tailored to your needs and easily integrated. Perfect for website elements or sections.",
    features: [
      "As many components in a month",
      "React / Next.js / Tailwind CSS code",
      "Design + Development",
      "Unlimited Revisions",
      "24-hour support response time",
      "Private communication channel",
      "4-7 days turnaround time",
      "Pause or cancel anytime",
    ],
    ctaText: "Coming Soon",
    featured: false,
    comingSoon: true,
  },
  {
    name: "Pages",
    subtitle: "pause or cancel anytime",
    price: 499,
    description:
      "Best for early-stage startups and businesses that need a marketing side and ongoing developmental work.",
    features: [
      "One request / page at a time",
      "React / Next.js / Tailwind CSS code",
      "Design + Development",
      "Unlimited Revisions",
      "Search Engine Optimization",
      "24-hour support response time",
      "Private communication channel",
      "7-10 days turnaround time",
      "Pause or cancel anytime",
    ],
    ctaText: "Buy Now",
    featured: false,
    url: 'https://tally.so/r/mZVbby',
  },
  {
    name: "Multi Page Website",
    subtitle: "starts at",
    price: 899,
    description:
      "Best for small businesses and startups that need a performant website that looks great and converts visitors to customers.",
    features: [
      "Multi-page landing page website",
      "Web Apps and SaaS Development",
      "Native Mobile Apps Development",
      "AI Apps Development",
      "Design + Development",
      "24-hour support response time",
      "Private communication channel",
      "Unlimited Revisions",
      "Negotiable delivery time",
    ],
    ctaText: "Buy Now",
    featured: true,
    url: 'https://tally.so/r/3jLkMx',
  },
]

export default function PricingSection() {
  const router = useRouter()

  const handleClick = (url: string) => {
    if (url) {
      router.push(url)
    }
  }

  return (
    <section className="container px-4 py-7 mx-auto max-w-6xl">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Simple pricing for everyone
        </h1>
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
          Choose an affordable plan packed with the maximum value for engaging your audience, creating customer loyalty, and driving sales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md ${
              plan.featured
                ? "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black ring-1 ring-gray-900/5 dark:ring-gray-100/5 ring-offset-inherit transition-all duration-150 ease-in-out hover:ring-1 hover:ring-black hover:ring-offset-1 hover:ring-offset-current dark:hover:ring-neutral-50"
                : "bg-white dark:bg-black ring-offset-inherit transition-all duration-150 ease-in-out hover:ring-1 hover:ring-black hover:ring-offset-1 hover:ring-offset-current dark:hover:ring-neutral-50"
            }`}
          >
            <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {plan.subtitle}
            </p>

            {plan.comingSoon ? (
              <div className="mb-4">
                <span className="text-2xl font-bold">
                  Coming Soon
                </span>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$</span>
                  <span className="text-4xl font-bold">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-base text-muted-foreground">
                    /mo
                  </span>
                </div>
              </div>
            )}

            <p className="mb-6 text-sm">
              {plan.description}
            </p>

            <Button
              className={`w-full rounded-full py-2 text-sm font-medium mb-6 transition-colors ${
                plan.featured
                  ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
              }`}
              disabled={plan.comingSoon}
            //   @ts-ignore
              onClick={() => handleClick(plan.url)}
            >
              {plan.ctaText}
            </Button>

            <ul className="space-y-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-center">
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Questions?
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
