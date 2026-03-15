import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BarChart3, Calendar, FileText, MessageCircle, Lock } from 'lucide-react';

/**
 * OwnerPortalPage — marketing/placeholder page for the owner dashboard.
 * Replace inner content with the actual auth-gated dashboard when ready.
 * For now this page describes the portal features and prompts owners to
 * request access.
 */
const FEATURES = [
  {
    icon: BarChart3,
    title: 'Live Revenue Dashboard',
    description: 'View real-time earnings, occupancy rates, and payout history. Compare performance against market benchmarks.',
  },
  {
    icon: Calendar,
    title: 'Booking Calendar',
    description: 'See all confirmed reservations, pending requests, and block dates for personal use — from any device.',
  },
  {
    icon: FileText,
    title: 'Monthly Statements',
    description: 'Download detailed monthly reports covering revenue, expenses, and maintenance invoices — all at cost, no markups.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    description: 'Communicate directly with your dedicated account manager. Average response time: under 60 minutes.',
  },
];

export default function OwnerPortalPage() {
  return (
    <>
      <Helmet>
        <title>Owner Portal — Christiano Property Management</title>
        <meta name="description" content="Access your owner dashboard to view bookings, revenue, statements, and communicate with your account manager." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />
      <main id="main" className="pt-20">
        <section className="section-container py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary mb-4">
            <Lock size={10} /> Owner Access
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">Your Owner Portal</h1>
          <p className="text-muted-foreground text-[15px] max-w-lg mx-auto mb-12 leading-relaxed">
            Full visibility into your property's performance, bookings, and financials — available 24/7.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 text-left">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="border border-border/50 p-5">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={15} className="text-primary" />
                </div>
                <h3 className="text-[13px] font-semibold mb-1.5">{title}</h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Placeholder CTA — swap for login button once auth is wired */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[13px] text-muted-foreground">Already a client? Contact your account manager to activate portal access.</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Request Portal Access
            </Link>
            <Link to="/owners" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors mt-1">
              Not yet a client? Learn about our services →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
