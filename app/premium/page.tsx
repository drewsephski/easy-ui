
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Metadata } from "next"
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Code, CreditCard, LayoutDashboard, ShoppingCart, Smartphone, Zap } from "lucide-react"
import { templatePrices, formatPrice } from '@/lib/template-prices';
import AnimatedBadge from '@/components/easyui/animated-badge';
// Templates data with images from the templates page
const allTemplates = [
  {
    name: 'EZ Beautiful',
    image: '/ez-beautiful.png',
    path: '/ez-beautiful',
    description: 'Design stunning interfaces',
    isNew: true,
    category: 'Design',
    difficulty: 'Beginner'
  },
  {
    name: 'EZ Glow',
    image: '/ez-gloww.png',
    path: '/ez-glow',
    description: 'Template for startups',
    isNew: true,
    category: 'Landing Page',
    difficulty: 'Beginner'
  },
  {
    name: 'EZ Premium',
    image: '/ez-premium.png',
    path: '/ez-premium',
    description: 'Pre-built Boilerplate with Auth & Stripe',
    isNew: true,
    category: 'Productivity',
    difficulty: 'Advanced'
  },
  {
    name: 'EZ Indigo',
    image: '/ez-indigo.png',
    path: '/ez-indigo',
    description: 'Create with an indigo theme',
    isNew: true,
    category: 'Design',
    difficulty: 'Beginner'
  },
  {
    name: 'EZ Design',
    image: '/ez-design.png',
    path: '/ez-design',
    description: 'Create beautiful designs effortlessly',
    category: 'Design',
    difficulty: 'Beginner',
    isFree: true
  },
  {
    name: 'EZ Newsletter',
    image: '/ez-newsletter.png',
    path: '/ez-newsletter',
    description: 'Design eye-catching newsletters',
    isNew: true,
    category: 'Email',
    difficulty: 'Beginner'
  },
  {
    name: 'EZ Tmp',
    image: '/eztmp1-img.png',
    path: '/ez-tmp',
    description: 'Versatile template for quick starts',
    isNew: true,
    category: 'General',
    difficulty: 'Advanced'
  },
  {
    name: 'EZ Tmp2',
    image: '/ez-tmp2.png',
    path: '/ez-tmp2',
    description: 'Another versatile template option',
    category: 'General',
    difficulty: 'Intermediate'
  },
  {
    name: 'EZ Tmp3',
    image: '/ez-tmp3.png',
    path: '/ez-tmp3',
    description: 'Third option for quick templating',
    isNew: true,
    category: 'General',
    difficulty: 'Intermediate'
  },
  {
    name: 'EZ Tmp4',
    image: '/ez-tmp4.png',
    path: '/ez-tmp4',
    description: 'Fourth quick-start template',
    isNew: true,
    category: 'General',
    difficulty: 'Intermediate'
  },
  {
    name: 'EZ Tmp5',
    image: '/ez-tmp5.png',
    path: '/ez-tmp5',
    description: 'Fifth option for rapid development',
    category: 'General',
    difficulty: 'Intermediate',
    isFree: true
  },
  {
    name: 'EZ NextUI',
    image: '/ez-nextui.png',
    path: '/ez-nextui',
    description: 'Leverage Next.js UI components',
    category: 'UI',
    difficulty: 'Intermediate',
    isFree: true
  },
  {
    name: 'EZ Notes',
    image: '/ez-notes.png',
    path: '/ez-notes',
    description: 'Create a sleek note-taking app',
    isNew: true,
    category: 'Productivity',
    difficulty: 'Advanced'
  },
  {
    name: 'EZ Dashboard',
    image: '/ez-dashboard.png',
    path: '/ez-dashboard',
    description: 'Build powerful dashboards',
    category: 'UI',
    difficulty: 'Intermediate',
    isFree: true
  },
  {
    name: 'EZ Docs',
    image: '/ez-docs.png',
    path: '/ez-docs',
    description: 'Craft comprehensive documentation',
    category: 'Documentation',
    difficulty: 'Advanced',
    isFree: true
  },
  {
    name: 'EZ Grids',
    image: '/ez-grids.png',
    path: '/ez-grids',
    description: 'Design with flexible grid layouts',
    category: 'UI',
    difficulty: 'Beginner'
  },
  {
    name: 'EZ Red',
    image: '/ez-red.png',
    path: '/ez-red',
    description: 'Design with a vibrant red theme',
    category: 'Design',
    difficulty: 'Intermediate',
    isFree: true
  }
];

// Define TemplateDifficulty type
type TemplateDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// Define the base template interface that matches the allTemplates structure
interface BaseTemplate {
  name: string;
  path: string;
  description: string;
  category: string;
  difficulty: TemplateDifficulty;
  image?: string;
  isNew?: boolean;
  isFree?: boolean;
}

// Define the unified template interface that includes all possible properties
type UnifiedTemplate = BaseTemplate & {
  id: string;
  title: string;
  price?: number;
  features?: string[];
  isPopular?: boolean;
};

const advancedAndPaidTemplates: UnifiedTemplate[] = allTemplates
  .filter(template => template.difficulty === 'Advanced' || template.isFree === false || template.isFree === undefined)
  .map(template => {
    // Find the matching template in allTemplates to get the image
    const matchingTemplate = allTemplates.find(t => t.path === template.path);
    return {
      ...template,
      id: template.path.startsWith('/') ? template.path.substring(1) : template.path,
      title: template.name,
      name: template.name, // Keep the name property for consistency
      image: matchingTemplate?.image,
      path: template.path.startsWith('/') ? template.path : `/${template.path}`,
      difficulty: template.difficulty as TemplateDifficulty,
      isFree: template.isFree ?? false,
      price: templatePrices[template.name] ?? 0,
      features: template.difficulty === 'Advanced'
        ? ["Full Source Code", "Lifetime Updates", "Community Support", "Advanced Features"]
        : ["Full Source Code", "Lifetime Updates", "Community Support"],
      isNew: template.isNew,
      isPopular: false,
    } as UnifiedTemplate;
  });

const allUnifiedTemplates: UnifiedTemplate[] = [...advancedAndPaidTemplates];

const categories = ['All', ...Array.from(new Set(allUnifiedTemplates.map((t: UnifiedTemplate) => t.category)))];

export default function PremiumPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (productName: string) => {
    setIsLoading(prev => ({ ...prev, [productName]: true }));
    setError(null);

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
        router.push(data.url);
      } else {
        setError(data.error || 'Failed to initiate checkout. Please try again.');
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error during checkout:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, [productName]: false }));
    }
  };

  const filteredTemplates = selectedCategory === 'All'
    ? allUnifiedTemplates
    : allUnifiedTemplates.filter(template => template.category === selectedCategory);

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary">
          <Zap className="mr-2 w-4 h-4" />
          Premium Templates Collection
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Ready-to-Use Templates
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Premium templates and boilerplates to kickstart your next project with professional design and functionality.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              category === selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-8 mb-12 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template: UnifiedTemplate) => (
          <div
            key={template.id}
            className={`relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${
              template.isPopular ? 'ring-2 ring-primary' : ''
            }`}
          >
            {template.isPopular && (
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                  Popular
                </span>
              </div>
            )}

            <div className="absolute top-4 right-4 z-10">
              <AnimatedBadge
                text={template.difficulty}
                bgColor={template.difficulty === 'Beginner' ? 'bg-green-900' : template.difficulty === 'Intermediate' ? 'bg-blue-900' : 'bg-red-900'}
                textColor={template.difficulty === 'Beginner' ? 'text-green-300' : template.difficulty === 'Intermediate' ? 'text-blue-300' : 'text-red-300'}
                gradientColor={template.difficulty === 'Beginner' ? 'from-transparent via-emerald-600 to-transparent' : template.difficulty === 'Intermediate' ? 'from-transparent via-blue-600 to-transparent' : 'from-transparent via-red-600 to-transparent'}
              />
            </div>

            {template.image && (
              <div className="flex justify-center items-center bg-gradient-to-br aspect-video from-primary/10 to-muted">
                <img src={template.image} alt={template.title} className="object-cover w-full h-full" />
              </div>
            )}
            {!template.image && (
              <div className="flex justify-center items-center bg-gradient-to-br aspect-video from-primary/10 to-muted">
                <div className="p-6 text-center">
                  {template.category === 'SaaS' && <LayoutDashboard className="mx-auto mb-3 w-12 h-12 text-primary" />}
                  {template.category === 'E-commerce' && <ShoppingCart className="mx-auto mb-3 w-12 h-12 text-primary" />}
                  {template.category === 'Portfolio' && <Code className="mx-auto mb-3 w-12 h-12 text-primary" />}
                  {template.category === 'Dashboard' && <LayoutDashboard className="mx-auto mb-3 w-12 h-12 text-primary" />}
                  {template.category === 'Landing Page' && <Smartphone className="mx-auto mb-3 w-12 h-12 text-primary" />}
                  <span className="text-xs font-medium text-muted-foreground">{template.category}</span>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">{template.title}</h3>
                {template.price !== undefined && (
                  <div className="text-lg font-bold">{formatPrice(template.price)}</div>
                )}
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {template.description}
              </p>

              {template.features && template.features.length > 0 && (
                <ul className="mb-6 space-y-2">
                  {template.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle className="mr-2 w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex space-x-3">
                {template.path && (
                  <Link
                    href={template.path.startsWith('/') ? template.path : `/${template.path}`}
                    className={buttonVariants({ variant: "outline", className: "flex-1" })}
                  >
                    View Details
                  </Link>
                )}
                <button
                  onClick={() => handleCheckout(template.name)}
                  className={buttonVariants({ className: "flex-1" })}
                  disabled={isLoading[template.name]}
                >
                  {isLoading[template.name] ? 'Processing...' : 'Get Template'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 text-center rounded-xl bg-muted/50">
        <h2 className="mb-4 text-2xl font-bold">Need something custom?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
          Our team can create a custom template or component tailored to your specific needs and requirements.
        </p>
        <div className="flex flex-col gap-3 justify-center sm:flex-row">
          <Link
            href="/contact"
            className={buttonVariants({ size: "lg" })}
          >
            Request Custom Work
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  )
}
