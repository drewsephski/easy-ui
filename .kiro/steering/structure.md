# Project Structure & Organization

## Root Structure
```
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── styles/                 # Global CSS and styling
├── public/                 # Static assets
├── posts/                  # MDX blog content
├── config/                 # Site configuration
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── prisma/                 # Database schema and migrations
└── scripts/                # Build and utility scripts
```

## App Directory (Next.js 14 App Router)
- `app/(auth)/` - Authentication pages (login, register)
- `app/(docs)/` - Documentation and component showcase pages
- `app/api/` - API routes for backend functionality
- `app/blog/` - Blog pages with dynamic routing
- Route groups use parentheses for organization without affecting URL structure

## Components Organization
- `components/ui/` - Base UI components (shadcn/ui style)
- `components/easyui/` - Custom Easy UI components
- `components/magicui/` - Magic UI component library
- `components/visual-editors/` - Interactive editing components
- Component files use PascalCase naming

## Key Conventions

### File Naming
- React components: PascalCase (e.g., `ButtonComponent.tsx`)
- Utility files: kebab-case (e.g., `blog-utils.ts`)
- Page files: lowercase (e.g., `page.tsx`)
- API routes: lowercase (e.g., `route.ts`)

### Import Aliases
- `@/*` - Root directory alias
- `contentlayer/generated` - Generated content types

### Content Structure
- Blog posts in `/posts/` as MDX files
- Static assets in `/public/`
- Component documentation co-located with components

### Configuration Files
- `components.json` - shadcn/ui configuration
- `contentlayer.config.ts` - Content processing configuration
- `tailwind.config.js` - Tailwind CSS customization
- `config/site.ts` - Site-wide configuration

### Styling Approach
- Tailwind utility classes for styling
- CSS variables for theming in `styles/globals.css`
- Component-specific styles using Tailwind
- Dark mode support through CSS variables

### State Management
- React Context for global state (theme, command palette)
- Local component state with hooks
- Form state with React Hook Form