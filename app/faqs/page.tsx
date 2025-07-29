"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
  
export default function FaqPage() {
    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="value-for-startups" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    How does Easy UI help small businesses save money and time?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Easy UI provides a powerful, ready-to-use foundation, allowing small businesses to get online and start attracting customers much faster. By using our pre-built, high-quality website sections and tools, you can significantly cut down on the time and money typically spent on website development. This means you can launch your business online quicker, reduce costs by up to $19,871, and launch 3.5 weeks earlier, freeing you to focus on your core business and customers.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="getting-started" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    How easy is it to set up and use Easy UI for my business?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Setting up Easy UI for your business is incredibly simple and efficient. Our tools are designed for ease of use, allowing you to quickly create and customize your website. Each section comes with clear, step-by-step guidance, making it easy for anyone to get started, no technical expertise required. This approach minimizes setup time, enabling you to quickly build a professional online presence and focus on what matters most: growing your business.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tech-stack" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    What kind of technology is used to build Easy UI?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Our templates are built with a modern, production-ready tech stack:
                    <ul className="mt-2 space-y-1 list-disc pl-5">
                        <li><span className="font-medium">Next.js 14+</span> - For optimal performance and SEO</li>
                        <li><span className="font-medium">React 18+</span> - For building interactive UIs</li>
                        <li><span className="font-medium">Tailwind CSS</span> - For rapid, responsive styling</li>
                        <li><span className="font-medium">ShadCN/UI</span> - Beautiful, accessible components</li>
                        <li><span className="font-medium">Framer Motion</span> - Smooth animations and transitions</li>
                        <li><span className="font-medium">TypeScript</span> - For type safety and better developer experience</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="customization" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    Can I easily customize my website to match my brand?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Definitely! Our templates are designed to be fully customizable. You can easily modify colors, fonts, and layouts using Tailwind CSS. Each component is built with customization in mind, and we provide clear documentation on how to make changes. Whether you're updating the color scheme, adjusting spacing, or completely restructuring components, our templates give you the flexibility to create something unique to your brand.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    What kind of support is available if I need help?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    We offer dedicated support and continuous maintenance for our templates to ensure your project's success. Our team is committed to providing timely updates, bug fixes, and performance enhancements. For direct assistance, you can reach out to our support team via [Support Channel/Email]. We also provide extensive documentation and tutorials to help you maximize the utility of our templates and resolve common queries efficiently.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}