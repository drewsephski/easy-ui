import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { Resend } from 'resend';

// Initialize Prisma with connection pooling for serverless environments
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Define product download URLs
const PRODUCT_DOWNLOAD_URLS: Record<string, string> = {
  // Free products
  'Introduction': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  'Create New Component': 'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip',
  // Add other products as needed
};

export async function POST(req: Request) {
  try {
    const { productName, quantity = 1, email } = await req.json();

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Get the download URL for the product
    const downloadUrl = PRODUCT_DOWNLOAD_URLS[productName] ||
                      'https://github.com/drewsephski/easy-ui/archive/refs/heads/main.zip';

    // In a real app, you would:
    // 1. Get the user's email from the session or request
    // 2. Create a purchase record in your database
    // 3. Send a confirmation email with the download link

    // Example database record creation (commented out for now)
    /*
    const purchase = await prisma.purchase.create({
      data: {
        productName,
        amount: 0, // Free
        currency: 'usd',
        status: 'completed',
        downloadUrl,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email, name: email.split('@')[0] },
          },
        },
      },
    });
    */

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Easy UI <noreply@easyui.dev>',
        to: email || 'customer@example.com', // Replace with actual user email
        subject: `Your ${productName} Download`,
        html: `
          <h1>Thank you for your purchase!</h1>
          <p>Your download is ready. Click the button below to download ${productName}.</p>
          <a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Download ${productName}
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${downloadUrl}</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase processed successfully',
      downloadUrl,
      redirectUrl: '/thank-you',
    });

  } catch (error) {
    console.error('Error processing free purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
