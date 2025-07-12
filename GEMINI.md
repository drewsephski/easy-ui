# Easy UI Application Description for Gemini CLI

This repository contains the source code for the **Easy UI** application, a Next.js project primarily serving as a comprehensive documentation and showcase platform for a UI component library and template marketplace. It integrates various modern web technologies and includes significant backend logic for authentication, e-commerce, and content management.

## Application Overview

- **Frontend Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Purpose**: Documentation and showcase for custom UI component libraries (Easy UI, Magic UI), a blog, and integrated e-commerce functionalities.

## Backend Logic and Key Features

The backend logic is primarily handled within the Next.js API routes (`app/api/`) and leverages several external services and libraries.

1. **Authentication**: Implemented using **Clerk** (`@clerk/nextjs`). This handles user registration, login, and session management. While Clerk manages the primary authentication state, user data is synchronized with the local application database. The `User` model in `prisma/schema.prisma` is linked to Clerk users via the email address. The webhook handler contains a `findOrCreateUser` function that provisions a user in the local database upon their first purchase.

2. **Database Management**: Utilizes **Prisma ORM** (`@prisma/client`, `prisma`) for database interactions. The schema, located at `prisma/schema.prisma`, defines the data models, including `User`, `Purchase`, `Subscription`, and an enum for `Role` (USER, ADMIN).

3. **E-commerce/Payment Processing**: Integrates with **Stripe** (`stripe`) for handling payments. The core logic is in two main API routes:
    - `app/api/checkout_sessions/route.ts`: Creates a Stripe Checkout Session for a given product.
    - `app/api/webhooks/route.ts`: Handles incoming webhooks from Stripe to process completed purchases.

4. **Email Services**: Uses **Resend** (`resend`) for sending transactional emails, specifically for purchase confirmations, which include a download link for the purchased product.

5. **Content Management**: The application uses **Contentlayer** (`contentlayer`, `next-contentlayer`) and **MDX** (`@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`) for managing and rendering documentation and blog content.

## Important Information for Gemini CLI

- **Project Type**: Next.js application.
- **Primary Language**: TypeScript.
- **Database ORM**: Prisma. Migrations are managed via the Prisma CLI (`prisma migrate dev`).
- **Key Directories for Backend Logic**:
  - `app/api/`: Contains all API routes.
  - `prisma/`: Contains the Prisma schema and migration files.
  - `lib/`: Contains shared utilities, including `template-prices.ts`.
- **Development and Build Commands**:
  - `pnpm dev`: Starts the development server.
  - `npm run build`: Builds the application for production.
  - `npm run start`: Starts the production server.

## Critical Integration Details

### Clerk Authentication

- **User Synchronization**: Clerk is the primary auth provider. When a user makes a purchase, the Stripe webhook handler uses the email from the Stripe session to find or create a corresponding user in the application's PostgreSQL database via the `findOrCreateUser` function.
- **Database Model**: The `User` model in `prisma/schema.prisma` stores user information, including a `stripeCustomerId`, their `role` (`USER` or `ADMIN`), and relations to their `purchases` and `subscription`.
- **Environment Variables**:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

### Stripe E-commerce Flow

The payment and product delivery flow is orchestrated between the frontend, Next.js API routes, and Stripe.

1. **Initiate Checkout**: A user clicks a "Buy" button (likely `components/BuyButton.tsx`), which sends a request to `app/api/checkout_sessions/route.ts` with a `productName`.
2. **Create Session**: This API route looks up the price in `lib/template-prices.ts` and uses the Stripe SDK to create a checkout session. It then returns the session URL to the frontend.
3. **Stripe Checkout**: The user is redirected to the Stripe-hosted checkout page to complete the payment.
4. **Webhook Notification**: Upon successful payment, Stripe sends a `checkout.session.completed` event to the `app/api/webhooks/route.ts` endpoint.
5. **Process Purchase (Webhook Handler)**:
    - The webhook handler first verifies the request signature using `STRIPE_WEBHOOK_SECRET`.
    - It extracts the customer email and product name from the session object.
    - It calls `findOrCreateUser` to ensure a user exists in the local DB.
    - It calls `processPurchase` which:
        - Creates a `Purchase` record in the database.
        - Grants access if necessary (e.g., updates the user's `role` to `ADMIN` for the 'EZ Premium' product).
    - It looks up the product's download URL from the `PRODUCT_DOWNLOAD_URLS` map.
    - It calls `sendConfirmationEmail` (using Resend) to send a thank you email with the download link to the customer.

- **Product Management**: Product prices are managed locally in `lib/template-prices.ts`. Digital product delivery is handled via a hardcoded map (`PRODUCT_DOWNLOAD_URLS`) in the webhook handler, which points to GitHub repository ZIP files.
- **Environment Variables**:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `RESEND_API_KEY`
- **Testing**: Use the Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks`) to test webhooks locally.

---

# Proposed Enhancements for Easy UI

## Performance Optimizations

1. **Image Optimization**
   - Implement Next.js Image component with proper sizing and quality settings
   - Add responsive image variants for different viewports
   - Consider using a CDN for static assets

2. **Code Splitting**
   - Implement dynamic imports for heavy components
   - Split large component libraries into chunks
   - Lazy load non-critical components

3. **Caching Strategy**
   - Implement proper cache headers for static assets
   - Add service worker for offline capabilities
   - Utilize Next.js ISR (Incremental Static Regeneration) for documentation pages

4. **Bundle Analysis**
   - Add `@next/bundle-analyzer` to identify large dependencies
   - Implement tree-shaking for all dependencies
   - Consider code-splitting for routes

## Developer Experience

1. **Documentation**
   - Add JSDoc comments to all components and utilities
   - Create a component API reference using TypeDoc
   - Add a contributing guide with development workflows

## New Features

## Enhance Page Builder Drag-and-Drop Interactivity

## Notes

- User wants a much more interactive page builder with improved drag-and-drop elements.
- Use React DnD (context7 for docs) for implementation.
- The codebase uses DraggableComponent and DraggableComponentWithPreview for drag sources.
- User has made changes to imports and component usage to support previews and more advanced drag/drop.
- The DraggableComponent uses custom drag previews and supports reordering.
- Enhanced DraggableComponent with better visual feedback, drop indicators, and fixed TypeScript/lint errors.

## Task List

- [ ] Review current implementation of drag and drop in page builder
- [ ] Fetch and review latest React DnD documentation
- [ ] Update DraggableComponent to support advanced drag/drop behaviors
- [ ] Fix drag-and-drop bugs and ref issues in DraggableComponent
- [ ] Test drag-and-drop behaviors for robustness and usability
- [ ] Further enhance interactivity (e.g., visual feedback, accessibility, mobile support)
- [ ] Refine UI/UX for clarity and feedback (animations, highlights, etc.)

## Current Goal

1. **Component Playground**
   - Interactive component playground with live editing
   - Code export functionality
   - Prop documentation with TypeScript types

2. **Design System**
   - Document design tokens (colors, typography, spacing)
   - Create a style guide
   - Add design system documentation

3. **API Documentation**
   - Generate OpenAPI/Swagger documentation for API routes
   - Add example requests and responses
   - Document error codes and responses

4. **Component Documentation**
   - Add usage examples for each component
   - Document component props with TypeScript types
   - Add interactive examples with CodeSandbox integration
