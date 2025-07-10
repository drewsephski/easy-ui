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
    productName: "Components Plan"
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
    productName: "Pages Plan"
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
    productName: "Multi Page Website Plan"
  },
]

export default function PricingSection() {
  const router = useRouter()

  const handleClick = async (productName?: string) => {
    if (!productName) return;

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName, quantity: 1 }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        console.error('Failed to initiate checkout:', data.error);
        alert(`Error: ${data.error}`); // Display error to user
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      alert('An unexpected error occurred. Please try again.');
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

            <p className="mb-6 text-sm text-muted-foreground">
              {plan.description}
            </p>

            <div className="mb-6">
              <Button
                className={`w-full rounded-full py-2 text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                }`}
                disabled={plan.comingSoon}
                onClick={() => handleClick(plan.productName)}
              >
                {plan.ctaText}
              </Button>
            </div>

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
