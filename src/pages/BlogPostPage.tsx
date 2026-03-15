import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

/**
 * BlogPostPage — renders a blog article by slug.
 * Currently uses static stub content. Replace `findPost` with a
 * Supabase/CMS query when the content pipeline is ready.
 */
const POSTS: Record<string, {
  title: string;
  date: string;
  category: string;
  readMin: number;
  html: string;
}> = {
  'malta-short-let-guide-2025': {
    title: 'The Complete Guide to Short-Let Property Management in Malta',
    date: '2025-03-01',
    category: 'Owners',
    readMin: 8,
    html: `
      <p>Malta's short-let market has grown over 60% in the last three years, making it one of the most
      attractive rental markets in Southern Europe. However, successful management requires
      understanding MTA licensing, dynamic pricing, and guest experience standards.</p>
      <h2>MTA Licensing</h2>
      <p>Every short-let property in Malta must hold a Malta Tourism Authority (MTA) licence before
      accepting paying guests. The application requires a property inspection, compliance certificate,
      and annual renewal fee. We handle the full process for all properties in our portfolio.</p>
      <h2>Dynamic Pricing</h2>
      <p>Flat nightly rates leave significant revenue on the table. Our AI-driven pricing engine adjusts
      rates daily based on local demand signals, competitor pricing, upcoming events, and historical
      booking patterns — consistently delivering 20–35% higher revenue than static pricing.</p>
      <h2>Guest Experience</h2>
      <p>Reviews are the currency of short-let success. Properties averaging 4.9+ stars command a 15–20%
      premium over the market. Our 42-point turnover checklist, sub-60-minute response SLA, and curated
      welcome packs consistently produce top-decile review scores.</p>
    `,
  },
  'valletta-rental-market-2025': {
    title: 'Valletta Rental Market: Trends & Opportunities',
    date: '2025-02-15',
    category: 'Market Insights',
    readMin: 6,
    html: `
      <p>Valletta, Malta's UNESCO World Heritage capital, has seen a surge in short-let demand driven by
      cultural tourism, business travel, and the growing digital nomad community. Average occupancy
      in prime Valletta locations reached 91% in Q4 2024.</p>
      <h2>Pricing Trends</h2>
      <p>Average nightly rates in Valletta increased 18% year-on-year in 2024, with peak season
      (June–September) regularly exceeding €180/night for well-presented one-bedroom apartments.</p>
      <h2>What Owners Are Doing Differently</h2>
      <p>Top-performing Valletta owners invest in quality photography, instant-book availability, and
      consistent five-star cleaning standards. Properties with direct booking capability reduce
      platform commissions by 12–18%, directly boosting owner net revenue.</p>
    `,
  },
  'airbnb-vs-direct-booking-malta': {
    title: 'Airbnb vs Direct Booking: Which Earns More in Malta?',
    date: '2025-01-20',
    category: 'Strategy',
    readMin: 5,
    html: `
      <p>OTA platforms like Airbnb and Booking.com provide unmatched distribution but charge 15–20%
      commission on every booking. Our portfolio data shows a clear case for building a direct booking
      channel alongside OTA presence.</p>
      <h2>The Numbers</h2>
      <p>Across our Malta portfolio, properties with a live direct booking page captured 23% of bookings
      direct in 2024 — saving owners an average of €1,840 annually in platform fees per property.</p>
      <h2>The Hybrid Strategy</h2>
      <p>The optimal strategy is not either/or. OTAs provide visibility and new-guest acquisition;
      direct booking retains repeat guests and captures corporate enquiries. We build and manage
      both channels for every property in the Complete plan.</p>
    `,
  },
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? POSTS[slug] : undefined;

  if (!post) {
    return (
      <>
        <Navbar />
        <main id="main" className="pt-20 section-container py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Article not found</h1>
          <Link to="/blog" className="text-primary text-sm hover:underline">← Back to Blog</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} — Christiano Property Management</title>
        <meta name="description" content={post.title + ' — Expert Malta property management insights.'} />
      </Helmet>
      <Navbar />
      <main id="main" className="pt-20">
        <article className="section-container max-w-2xl mx-auto py-16">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={12} /> Back to Blog
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary mb-3">{post.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-10 border-b border-border/40 pb-6">
            <span>{new Date(post.date).toLocaleDateString('en-MT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>{post.readMin} min read</span>
          </div>
          <div
            className="prose prose-sm max-w-none text-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:text-[14px] [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <div className="mt-12 pt-8 border-t border-border/40">
            <p className="text-[13px] text-muted-foreground mb-4">Ready to maximise your Malta property's income?</p>
            <Link
              to="/owners/estimate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Get Your Free Estimate
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
