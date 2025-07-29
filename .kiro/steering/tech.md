# Technology Stack & Build System

## Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety throughout

## Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Framer Motion** - Animation library
- **CSS Variables** - Theme system using HSL color space
- **Dark Mode** - Built-in theme switching support

## Content & Data
- **Contentlayer** - Content management for MDX blog posts
- **MDX** - Markdown with JSX for rich content
- **Prisma** - Database ORM
- **Clerk** - Authentication system

## Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Key Libraries
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **React DnD** - Drag and drop functionality
- **Stripe** - Payment processing
- **Resend** - Email service

## Common Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm preview      # Build and start locally
```

### Code Quality
```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm typecheck    # TypeScript type checking
pnpm format:write # Format code with Prettier
pnpm format:check # Check code formatting
```

### Database
```bash
prisma generate   # Generate Prisma client
prisma db push    # Push schema changes
```

## Build Process
1. Prisma client generation
2. Next.js build with Contentlayer integration
3. Static optimization and bundling