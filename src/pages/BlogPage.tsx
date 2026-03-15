import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

/** Static seed articles — swap for Supabase/CMS fetch when ready. */
const POSTS = [
  {
    slug: 'malta-short-let-guide-2025',
    title: 'The Complete Guide to Short-Let Property Management in Malta',
    excerpt: 'Everything you need to know about Malta Tourism Authority licensing, setting up your listing, and maximising your rental income in 2025.',
    category: 'Owners',
    date: '2025-03-01',
    readMin: 8,
    image: '',
  },
  {
    slug: 'valletta-rental-market-2025',
    title: 'Valletta Rental Market: Trends & Opportunities for Property Owners',
    excerpt: 'A deep dive into Valletta's booming short-let market — occupancy rates, pricing trends, and what savvy owners are doing differently.',
    category: 'Market Insights',
    date: '2025-02-15',
    readMin: 6,
    image: '',
  },
  {
    slug: 'airbnb-vs-direct-booking-malta',
    title: 'Airbnb vs Direct Booking: Which Earns More in Malta?',
    excerpt: 'We crunched the numbers across our portfolio. Here's what the data says about OTAs vs direct booking channels for Malta properties.',
    category: 'Strategy',
    date: '2025-01-20',
    readMin: 5,
    image: '',
  },
];

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title>Blog — Christiano Property Management</title>
        <meta name="description" content="Expert insights on Malta property management, rental market trends, and owner strategies from Christiano Vincenti." />
      </Helmet>
      <Navbar />
      <main id="main" className="pt-20">
        <section className="section-container py-16 md:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary mb-3">Insights</p>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">Malta Property Blog</h1>
            <p className="text-muted-foreground text-[15px] leading-relaxed">
              Expert guides, market data, and owner strategies from Malta's leading property management team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex flex-col border border-border/50 bg-card hover:border-border transition-colors"
              >
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-widest">{post.category}</span>
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary mb-2">{post.category}</span>
                  <h2 className="text-[14px] font-semibold font-display leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-[12px] text-muted-foreground leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={10} />{new Date(post.date).toLocaleDateString('en-MT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{post.readMin} min read</span>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:gap-2 transition-all">
                    Read article <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
