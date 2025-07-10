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
                    How do Easy UI templates accelerate startup development?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Easy UI templates provide a robust and modern foundation, allowing startups to launch faster and iterate more efficiently. By leveraging pre-built, high-quality components and pages, you can significantly reduce development time and costs, focusing your resources on core business logic and innovation. Our templates are designed for scalability and performance, ensuring your product can grow with your startup.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="getting-started" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    What is the typical integration process for Easy UI templates?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Integrating Easy UI templates into your project is streamlined for efficiency. Our templates are built with modularity in mind, allowing for easy drag-and-drop or copy-pasting of components and sections. Each template comes with clear instructions and is designed to be compatible with standard Next.js and React project structures. This approach minimizes setup time, enabling your team to quickly incorporate powerful UI elements and focus on customization rather than foundational development.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tech-stack" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    What technologies power Easy UI templates?
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
                    Can I customize the templates to match my brand?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    Definitely! Our templates are designed to be fully customizable. You can easily modify colors, fonts, and layouts using Tailwind CSS. Each component is built with customization in mind, and we provide clear documentation on how to make changes. Whether you're updating the color scheme, adjusting spacing, or completely restructuring components, our templates give you the flexibility to create something unique to your brand.
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">
                    What kind of support and maintenance is available?
                </AccordionTrigger>
                <AccordionContent className="pt-2 text-muted-foreground">
                    We offer dedicated support and continuous maintenance for our templates to ensure your project's success. Our team is committed to providing timely updates, bug fixes, and performance enhancements. For direct assistance, you can reach out to our support team via [Support Channel/Email]. We also provide extensive documentation and tutorials to help you maximize the utility of our templates and resolve common queries efficiently.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}