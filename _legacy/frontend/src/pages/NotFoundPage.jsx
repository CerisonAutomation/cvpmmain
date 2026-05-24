import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <SEO title="Page Not Found" description="The page you requested could not be found." />
      <h1 className="font-serif text-6xl text-[#D4AF37] mb-4">404</h1>
      <p className="text-[#A1A1AA] mb-8 max-w-md">This page does not exist or may have been moved.</p>
      <Link to="/" className="px-6 py-3 bg-[#D4AF37] text-[#0F0F10] font-semibold hover:bg-[#C9A227] transition-colors">
        Return Home
      </Link>
    </div>
  );
}
