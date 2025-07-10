import React from 'react';

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold text-red-600">Payment Cancelled</h1>
      <p className="mt-3 text-lg">Your payment was not completed.</p>
      <p className="mt-1 text-md">If you have any questions, please contact support.</p>
      <a href="/" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Home
      </a>
    </div>
  );
}