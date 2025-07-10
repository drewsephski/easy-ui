import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@/generated/prisma';
import { Resend } from 'resend';
import { headers } from 'next/headers';

// Initialize Prisma with connection pooling for serverless environments
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Initialize Stripe with the installed package version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
  maxNetworkRetries: 2,
});

// Validate required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Map product names to their GitHub repository download URLs
const PRODUCT_DOWNLOAD_URLS: Record<string, string> = {
  // Premium Templates
  'EZ Premium': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ SaaS': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ AI': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Beautiful': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Dashboard': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Marketplace': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ NextUI': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  
  // Standard Templates
  'EZ Blog': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Chatbot': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Design': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Portfolio': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Portfolio 2': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Story': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Web': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  
  // Basic Templates
  'EZ Docs': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Glow': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Haze': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Indigo': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Landing': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Notes': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Red': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Shots': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Waitlist': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Grids': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Newsletter': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  
  // Component Templates
  'Animated Badge': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Animated Beam': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Beam Card': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Colored Button': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Confetti Poll': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Design Fast': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Feature Card': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'File Upload': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Firefly Button': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Glitch Text': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Hexagon Hero': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Highlighter': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Idea Form': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Key Button': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Launchpad': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Logo Particles': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Pixel Card': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Quotes AI': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Reaction Bar': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  
  // Plans
  'Pages Plan': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'EZ Boilerplate': '/easy-ui-boilerplate.zip'
};

// Email template for purchase confirmation
async function sendConfirmationEmail(email: string, productName: string, downloadUrl?: string) {
  try {
    const emailContent = {
      from: 'Easy UI <purchases@easyui.pro>',
      to: email,
      subject: `Your ${productName} Purchase Confirmation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          <p>Your order for <strong>${productName}</strong> has been confirmed.</p>
          ${downloadUrl ? `
            <p>You can download your files here: <a href="${downloadUrl}">Download ${productName}</a></p>
          ` : ''}
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Easy UI Team</p>
        </div>
      `,
    };

    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in sendConfirmationEmail:', error);
    return false;
  }
}

// Helper function to find or create a user
async function findOrCreateUser(email: string, stripeCustomerId?: string) {
  try {
    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Simple name from email
          stripeCustomerId,
          role: 'USER', // Default role
        },
      });
      console.log(`Created new user: ${email}`);
    } else if (stripeCustomerId && user.stripeCustomerId !== stripeCustomerId) {
      // Update stripeCustomerId if it's different
      user = await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
      console.log(`Updated stripeCustomerId for user: ${email}`);
    }
    return user;
  } catch (error: unknown) {
    console.error('Error in findOrCreateUser:', error instanceof Error ? error.message : error);
    throw new Error('Failed to process user account');
  }
}

// Type for purchase data
interface PurchaseData {
  userId: string;
  productName: string;
  amount: number;
  currency: string;
  status: string;
  downloadUrl: string | null;
}

// Helper function to process purchase and grant access
async function processPurchase(
  userId: string, 
  productName: string, 
  options: {
    downloadUrl?: string;
    checkoutSession?: Stripe.Checkout.Session;
  } = {}
) {
  const { downloadUrl = null, checkoutSession } = options;
  
  try {
    // Example: Grant access based on product name
    if (productName === 'EZ Premium') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' }, // Example: Grant ADMIN role for premium access
      });
      console.log(`User ${userId} granted ADMIN role for EZ Premium.`);
    } else if (productName === 'Starter Template' || productName === 'Pro Template') {
      // Implement specific access logic for other templates
      console.log(`User ${userId} purchased ${productName}. Implement specific access logic.`);
    }

    // Prepare purchase data
    const purchaseData: PurchaseData = {
      userId,
      productName,
      amount: checkoutSession?.amount_total ? checkoutSession.amount_total / 100 : 0, // Convert from cents
      currency: checkoutSession?.currency?.toUpperCase() || 'USD',
      status: 'COMPLETED',
      downloadUrl,
    };

    // Record the purchase in the database
    await prisma.purchase.create({
      data: purchaseData,
    });
    
    console.log(`Purchase recorded for user ${userId}: ${productName}`);
    return purchaseData;

  } catch (error: unknown) {
    console.error('Error in processPurchase:', error instanceof Error ? error.message : error);
    throw new Error('Failed to process purchase');
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Webhook received');
    
    // Get raw body as text
    const body = await request.text();
    const signature = headers().get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(`Received event type: ${event.type}`);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Processing event type: ${event.type}`);
    console.log('Event ID:', event.id);
    
    // Skip processing test events that don't have a session ID
    if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment Intent ID:', paymentIntent.id);
      
      // If this is a test event without a session ID, just acknowledge it
      if (paymentIntent.metadata && !paymentIntent.metadata.session_id) {
        console.log('Test payment intent received, no session ID - skipping processing');
        return NextResponse.json({ received: true });
      }
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
      case 'payment_intent.succeeded':
      case 'charge.succeeded': {
        // For payment_intent and charge events, we need to fetch the checkout session
        let checkoutSession: Stripe.Checkout.Session | null = null;
        
        if (event.type === 'checkout.session.completed') {
          checkoutSession = event.data.object as Stripe.Checkout.Session;
        } else {
          // For payment_intent and charge events, get the payment intent first
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Get the session ID from the payment intent's metadata
          let sessionId = paymentIntent.metadata?.session_id;
          
          // If we don't have a session ID in metadata, try to get it from the latest charge
          if (!sessionId && paymentIntent.latest_charge) {
            try {
              // Retrieve the charge to get the session ID if available
              const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string, {
                expand: ['payment_intent']
              });
              
              // Check if the charge has a session ID in its metadata
              if (charge.metadata?.session_id) {
                sessionId = charge.metadata.session_id;
              }
            } catch (error) {
              console.error('Error retrieving charge:', error);
            }
          }
          
          if (!sessionId) {
            console.error('No session ID found in payment intent:', paymentIntent.id);
            console.log('Payment intent metadata:', paymentIntent.metadata);
            return NextResponse.json(
              { received: true, error: 'No session ID found in payment intent' },
              { status: 200 }
            );
          }
          
          try {
            // Retrieve the checkout session with expanded line items
            checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
              expand: ['line_items', 'payment_intent']
            });
            console.log('Retrieved checkout session:', checkoutSession.id);
          } catch (error) {
            console.error('Error retrieving checkout session:', error);
            return NextResponse.json(
              { received: true, error: 'Failed to retrieve checkout session' },
              { status: 200 }
            );
          }
        }

        if (!checkoutSession) {
          console.error('Failed to retrieve checkout session');
          return NextResponse.json(
            { received: true, error: 'Failed to process checkout session' },
            { status: 200 }
          );
        }

        console.log('Processing purchase for session:', checkoutSession.id);
        console.log('Payment status:', checkoutSession.payment_status);

        const customerEmail = checkoutSession.customer_details?.email || 
                            (checkoutSession.customer_details as any)?.email;
        const stripeCustomerId = checkoutSession.customer;

        if (!customerEmail) {
          console.error('No customer email found in checkout session.');
          return NextResponse.json(
            { error: 'No customer email found' },
            { status: 400 }
          );
        }

        // Retrieve product name from line items
        let productName: string | undefined;
        let lineItems: Stripe.LineItem[] = [];

        if (checkoutSession.line_items) {
          // If we already have expanded line items, use them
          if ('data' in checkoutSession.line_items) {
            lineItems = checkoutSession.line_items.data;
          } else {
            // Otherwise, retrieve them
            const items = await stripe.checkout.sessions.listLineItems(checkoutSession.id, { limit: 10 });
            lineItems = items.data;
          }
          
          if (lineItems.length > 0) {
            productName = lineItems[0].description || (lineItems[0].price?.product as any)?.name;
            console.log('Product Purchased:', productName);
            
            // If we only have a product ID, try to get its name
            if (productName && productName.startsWith('prod_')) {
              try {
                const product = await stripe.products.retrieve(productName);
                productName = product.name;
              } catch (error) {
                console.error('Error retrieving product:', error);
              }
            }
          }
        }

        // If we still don't have a product name, try to get it from the session metadata
        if (!productName && checkoutSession.metadata?.productName) {
          productName = checkoutSession.metadata.productName;
        }

        // If we still don't have a product name, use a default
        if (!productName) {
          productName = 'Easy UI Product';
          console.warn('No product name found, using default');
        }

        // Find or create user and process purchase
        try {
          const user = await findOrCreateUser(
            customerEmail, 
            typeof stripeCustomerId === 'string' ? stripeCustomerId : undefined
          );
          
          const downloadUrl = productName ? 
            (PRODUCT_DOWNLOAD_URLS[productName] || 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip') : 
            'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip';

          await processPurchase(
            user.id, 
            productName,
            {
              downloadUrl,
              checkoutSession
            }
          );
          
          await sendConfirmationEmail(
            customerEmail, 
            productName, 
            downloadUrl
          );
          
          console.log('Purchase processed successfully for:', customerEmail);
          
        } catch (error) {
          console.error('Error processing purchase:', error);
          // Don't return an error response here to prevent Stripe from retrying
          // Instead, log the error and continue
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // Handle subscription changes
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId },
        });

        if (user) {
          // Update user's subscription status
          await prisma.user.update({
            where: { id: user.id },
            data: {
              // Add other subscription fields as needed
            },
          });

          console.log(`Updated subscription status for ${user.email} to ${subscription.status}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        // Handle failed payments
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn('Payment failed:', paymentIntent.id);
        // Additional failure handling logic can be added here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing webhook:', error);

    return NextResponse.json(
      { error: `Webhook error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
