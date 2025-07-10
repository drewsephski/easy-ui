import React from 'react';

export default function SuccessPage() {
  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[900px] rounded-md bg-black bg-opacity-5 p-11 text-center shadow-signUp dark:bg-dark sm:p-[55px] lg:p-11 xl:p-[55px]">
              <h1 className="mb-3 text-2xl font-bold leading-tight text-green-500 dark:text-green-500 sm:text-3xl sm:leading-tight lg:text-2xl lg:leading-tight xl:text-3xl xl:leading-tight">
                Payment Successful!
              </h1>
              <p className="mb-12 text-base font-medium text-body-color">
                Thank you for your purchase. Your order has been processed.
              </p>
              <a
                href="/"
                className="mb-4 inline-flex items-center justify-center rounded-md bg-green-500 px-5 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-green-600 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Go to Home
              </a>

              <div className="mt-8 border-t border-gray-200 pt-8 text-center">
                <h2 className="mb-3 text-xl font-bold leading-tight text-green-500 dark:text-green-500 sm:text-2xl sm:leading-tight lg:text-xl lg:leading-tight xl:text-2xl xl:leading-tight">
                  Manage Your Purchases
                </h2>
                <p className="mb-8 text-base font-medium text-body-color">
                  To view your order history and re-download your products at any time, please create an account or log in using the same email you used for your purchase.
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center rounded-md bg-green-500 px-5 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-green-600 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                  >
                    Sign Up
                  </a>
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md bg-green-500 px-5 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-green-600 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                  >
                    Log In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}