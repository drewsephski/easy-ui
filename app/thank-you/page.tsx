import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import SparkleButton from "@/components/easyui/sparkle-button";

export default function ThankYouPage() {
  return (
    <div className="flex justify-center items-center px-4 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-8 space-y-6 w-full max-w-md text-center bg-white rounded-xl shadow-lg">
        <div className="flex justify-center">
          <div className="flex justify-center items-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>

        <p className="text-gray-600">
          Your free download is being processed. Please check your email for the download link.
        </p>

        <div className="pt-4">
          <p className="mb-4 text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or contact support.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
            <SparkleButton text="Browse More Templates" size="lg" variant="default" href="/template-library"/>
          </div>
        </div>
      </div>
    </div>
  );
}
