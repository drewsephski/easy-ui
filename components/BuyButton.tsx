"use client";

import React, { useState } from 'react';

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface BuyButtonProps {
  productName: string;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

const BuyButton: React.FC<BuyButtonProps> = ({ productName, quantity = 1, className, size }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    console.log('BuyButton clicked!'); // Add this line for debugging
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setError(data.error || 'Failed to initiate checkout. Please try again.');
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error during checkout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCheckout}
        className={cn(buttonVariants({ size }), className, "relative z-50")}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default BuyButton;