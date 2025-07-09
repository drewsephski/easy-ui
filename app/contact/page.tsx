"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { toast } from "sonner"
import { Icons } from "@/components/icons"
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";

type FormData = {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
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
      toast.success("Your message has been sent successfully!")
      reset()
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container px-4 py-12 mx-auto max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Contact Us
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name", { required: "Name is required" })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="How can we help?"
              {...register("subject", { required: "Subject is required" })}
              className={errors.subject ? "border-destructive" : ""}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your message here..."
              rows={6}
              {...register("message", { required: "Message is required" })}
              className={errors.message ? "border-destructive" : ""}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Email Us</h3>
          <p className="text-muted-foreground">contact@easyui.pro</p>
        </div>

        <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Call Us</h3>
          <p className="text-muted-foreground">+1 (555) 123-4567</p>
        </div>

        <div className="p-6 rounded-lg border shadow-sm bg-card text-card-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Visit Us</h3>
          <p className="text-muted-foreground">1234 Design Street, Creative City, 10001</p>
        </div>
      </div>
    </div>
  )
}
