"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CreditCard, Lock } from "lucide-react"

type FormData = {
  name: string
  email: string
  cardNumber: string
  expiryDate: string
  cvc: string
  country: string
  zipCode: string
}

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState({
    name: "Premium Template",
    price: 49.99,
    features: ["Full Source Code", "Lifetime Updates", "Community Support"]
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Show success message
      toast.success("Payment successful! Your template is ready to download.")
      reset()
    } catch (error) {
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container px-4 py-12 mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Complete Your Purchase
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Secure checkout for {selectedTemplate.name}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
            <h2 className="mb-6 text-2xl font-semibold">Payment Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Information</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    placeholder="1234 1234 1234 1234"
                    {...register("cardNumber", { 
                      required: "Card number is required",
                      pattern: {
                        value: /^[0-9\s]{13,19}$/,
                        message: "Invalid card number"
                      }
                    })}
                    className={`pl-10 ${errors.cardNumber ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.cardNumber && (
                  <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    {...register("expiryDate", { 
                      required: "Expiry date is required",
                      pattern: {
                        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                        message: "Invalid expiry date"
                      }
                    })}
                    className={errors.expiryDate ? "border-destructive" : ""}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cvc"
                      placeholder="CVC"
                      {...register("cvc", { 
                        required: "CVC is required",
                        pattern: {
                          value: /^[0-9]{3,4}$/,
                          message: "Invalid CVC"
                        }
                      })}
                      className={`pl-10 ${errors.cvc ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.cvc && (
                    <p className="text-sm text-destructive">{errors.cvc.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    {...register("country", { required: "Country is required" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="ZIP / Postal Code"
                    {...register("zipCode", { 
                      required: "ZIP / Postal code is required"
                    })}
                    className={errors.zipCode ? "border-destructive" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${selectedTemplate.price.toFixed(2)}`
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Lock className="mr-2 h-4 w-4" />
                Secure SSL encrypted payment
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template</span>
                <span className="font-medium">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${selectedTemplate.price.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedTemplate.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
            <h3 className="mb-3 text-lg font-semibold">What's Included</h3>
            <ul className="space-y-2">
              {selectedTemplate.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
