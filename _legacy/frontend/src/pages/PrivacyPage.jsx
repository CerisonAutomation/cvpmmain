import { SEO } from "@/components/SEO";

export const PrivacyPage = () => (
  <div className="min-h-screen bg-[#0F0F10] pt-32 pb-20">
    <SEO title="Privacy Policy" />
    <div className="max-w-3xl mx-auto px-6 md:px-12">
      <h1 className="heading text-3xl md:text-4xl text-[#F5F5F0] mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none text-[#A1A1AA] space-y-4 text-sm leading-relaxed">
        <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you use our website and services.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email address, phone number, and payment details when making a booking or inquiry.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">How We Use Your Information</h2>
        <p>We use your information to process bookings, communicate with you about your reservation, send service updates, and improve our offerings.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Data Protection</h2>
        <p>We implement appropriate security measures to protect your personal information. We do not sell your data to third parties.</p>
        <h2 className="text-[#F5F5F0] text-lg mt-8 mb-3">Contact</h2>
        <p>For privacy-related inquiries, please contact us at info@christianopropertymanagement.com.</p>
        <p className="mt-8 text-xs text-[#71717A]">Last updated: January 2025</p>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
