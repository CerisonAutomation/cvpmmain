import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export function ServerErrorPage({ onRetry }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <SEO title="Something Went Wrong" description="An unexpected error occurred." />
      <h1 className="font-serif text-5xl text-[#D4AF37] mb-4">500</h1>
      <p className="text-[#A1A1AA] mb-8 max-w-md">We hit an unexpected error. Please try again.</p>
      <div className="flex gap-4">
        {onRetry && (
          <button type="button" onClick={onRetry} className="px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
            Try Again
          </button>
        )}
        <Link to="/" className="px-6 py-3 bg-[#D4AF37] text-[#0F0F10] font-semibold hover:bg-[#C9A227] transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
