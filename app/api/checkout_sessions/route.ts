import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { templatePrices } from '@/lib/template-prices';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { productName, quantity } = await req.json(); // Get productName

    // Define price based on product name - All prices in cents (e.g., 9900 = $99.00)
    const unit_amount = templatePrices[productName];

    if (unit_amount === undefined) {
      const availableProducts = Object.keys(templatePrices).join(', ');
      throw new Error(
        `Invalid product name: "${productName}". ` +
        `Available products: ${availableProducts}`
      );
    }

    

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName || 'Easy UI Component Pack', // Use productName
            },
            unit_amount: unit_amount,
          },
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
