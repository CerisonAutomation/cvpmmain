import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import LeadModal from '@/components/LeadModal';

const posts = [
  { slug: 'malta-property-investment-guide-2025', title: 'Malta Property Investment Guide 2025', excerpt: 'Everything you need to know before buying a short-stay investment property in Malta — yields, locations, legal requirements, and management.', category: 'Investment', readTime: '8 min', date: '2025-11-01', image: null },
  { slug: 'best-areas-to-stay-malta', title: 'Best Areas to Stay in Malta: St Julian's, Valletta & Sliema Compared', excerpt: 'A practical guide to Malta\'s most popular neighbourhoods for short stays — walkability, nightlife, beach access, and what type of traveller each suits best.', category: 'Travel Guide', readTime: '6 min', date: '2025-10-15', image: null },
  { slug: 'how-to-maximise-airbnb-income-malta', title: 'How to Maximise Your Airbnb Income in Malta', excerpt: 'Dynamic pricing, listing optimisation, response rates, and the one thing most Malta hosts get wrong that costs them 20% of potential income.', category: 'Owner Tips', readTime: '7 min', date: '2025-09-20', image: null },
  { slug: 'malta-eco-tax-explained', title: 'Malta Eco Tax Explained for Short-Stay Property Owners', excerpt: 'A plain-language breakdown of Malta\'s Eco Contribution, how it\'s collected, what you owe, and how we handle it on your behalf.', category: 'Legal & Tax', readTime: '5 min', date: '2025-09-05', image: null },
  { slug: 'gozo-holiday-rental-opportunity', title: 'Why Gozo is Malta\'s Next Big Holiday Rental Opportunity', excerpt: 'Gozo\'s tourist numbers have grown 40% in 3 years. Here\'s why smart investors are looking at the sister island before the market matures.', category: 'Investment', readTime: '6 min', date: '2025-08-18', image: null },
  { slug: 'property-management-vs-self-manage', title: 'Self-Managing vs. Professional Property Management in Malta', excerpt: 'We break down the real time cost, risk, and income difference — backed by data from our own portfolio of 40+ managed properties.', category: 'Owner Tips', readTime: '9 min', date: '2025-07-30', image: null },
];

const categories = ['All', 'Investment', 'Owner Tips', 'Travel Guide', 'Legal & Tax'];

export default function BlogPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Malta Property Blog — Christiano Vincenti"
        description="Expert guides on Malta property investment, short-stay management, Airbnb tips, and travel guides for property owners and guests."
        keywords={['Malta property investment', 'Airbnb Malta tips', 'Malta short-stay rental guide', 'Malta travel blog']}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Blog</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] mb-4">Malta Property Insights</h1>
              <p className="text-muted-foreground text-lg max-w-xl">Expert guides for property owners, investors, and guests exploring Malta.</p>
            </FadeInView>
          </div>
        </section>

        <section className="py-12">
          <div className="section-container">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    activeCategory === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <FadeInView key={post.slug} delay={i * 0.07}>
                  <Link to={`/blog/${post.slug}`} className="group block border border-border/30 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-muted/30 flex items-center justify-center">
                      <Tag className="w-8 h-8 text-primary/30" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{post.category}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{post.readTime}</span>
                      </div>
                      <h3 className="font-semibold leading-snug mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={10} />{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Owner CTA */}
        <section className="py-20 bg-primary/5 border-t border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-2xl font-bold mb-3">Own a property in Malta?</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Get a free income estimate based on your property's location, size, and current market data.</p>
              <button onClick={() => setLeadOpen(true)} className="btn-primary">Get Free Estimate</button>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="owner" />
    </div>
  );
}
