import { SEO } from "@/components/SEO";

export const TermsPage = () => (
  <div className="min-h-screen bg-[#0F0F10] pt-32 pb-20">
    <SEO title="Terms of Service" />
    <div className="max-w-3xl mx-auto px-6 md:px-12">
      <h1 className="heading text-3xl md:text-4xl text-[#F5F5F0] mb-8">Terms of Service</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4 text-sm leading-relaxed">
        <p>By using our website and services, you agree to the following terms and conditions.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Booking & Reservations</h2>
        <p>All bookings are subject to availability and confirmation. Payment terms, cancellation policies, and check-in/out times are specified at the time of booking.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Guest Responsibilities</h2>
        <p>Guests agree to use properties respectfully, comply with house rules, and are responsible for any damages caused during their stay beyond normal wear and tear.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Limitation of Liability</h2>
        <p>We strive to provide accurate information but cannot guarantee uninterrupted service. We are not liable for damages beyond the total booking amount.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Contact</h2>
        <p>For any questions regarding these terms, contact us at info@christianopropertymanagement.com.</p>
        <p className="mt-8 text-xs text-[#71717A]">Last updated: January 2025</p>
      </div>
    </div>
  </div>
);

export default TermsPage;
