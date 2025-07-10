'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginForm() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignIn />
    </div>
  );
}
