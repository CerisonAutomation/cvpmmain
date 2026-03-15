import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, ArrowRight } from 'lucide-react';

/**
 * LocationPage — SEO landing pages per Malta locality.
 * Add new entries to LOCATIONS to generate new pages automatically.
 */
const LOCATIONS: Record<string, {
  name: string;
  headline: string;
  body: string;
  stats: { label: string; value: string }[];
}> = {
  sliema: {
    name: 'Sliema',
    headline: 'Short-Let Property Management in Sliema',
    body: 'Sliema is one of Malta\'s most in-demand short-let markets, combining seafront promenades, vibrant dining, and excellent transport links. Our Sliema portfolio consistently achieves 92%+ occupancy year-round.',
    stats: [
      { label: 'Avg Occupancy', value: '92%' },
      { label: 'Avg Nightly Rate', value: '€145' },
      { label: 'Properties Managed', value: '12+' },
      { label: 'Avg Guest Rating', value: '4.97' },
    ],
  },
  valletta: {
    name: 'Valletta',
    headline: 'Short-Let Property Management in Valletta',
    body: 'Malta\'s UNESCO World Heritage capital commands premium nightly rates and near-100% peak-season occupancy. Valletta properties benefit from cultural tourism, business travel, and a thriving food & arts scene.',
    stats: [
      { label: 'Avg Occupancy', value: '91%' },
      { label: 'Avg Nightly Rate', value: '€165' },
      { label: 'Properties Managed', value: '8+' },
      { label: 'Avg Guest Rating', value: '4.98' },
    ],
  },
  'st-julians': {
    name: "St Julian's",
    headline: "Short-Let Property Management in St Julian's",
    body: "St Julian's is Malta's entertainment and hospitality hub — home to Spinola Bay, Paceville, and some of the island's finest restaurants. High footfall and excellent connectivity drive strong short-let demand year-round.",
    stats: [
      { label: 'Avg Occupancy', value: '89%' },
      { label: 'Avg Nightly Rate', value: '€135' },
      { label: 'Properties Managed', value: '10+' },
      { label: 'Avg Guest Rating', value: '4.96' },
    ],
  },
  gozo: {
    name: 'Gozo',
    headline: 'Short-Let Property Management in Gozo',
    body: "Gozo's rural character, dramatic coastline, and growing remote-worker appeal make it a uniquely attractive alternative to Malta's busier towns. Longer average stays and a loyal repeat-guest base deliver excellent owner returns.",
    stats: [
      { label: 'Avg Occupancy', value: '85%' },
      { label: 'Avg Nightly Rate', value: '€120' },
      { label: 'Properties Managed', value: '6+' },
      { label: 'Avg Guest Rating', value: '4.97' },
    ],
  },
  mellieha: {
    name: 'Mellieħa',
    headline: 'Short-Let Property Management in Mellieħa',
    body: "Mellieħa's sandy beaches, panoramic views, and family-friendly environment attract holidaymakers from across Europe. Seasonal demand peaks are among the strongest on the island, with summer occupancy regularly exceeding 97%.",
    stats: [
      { label: 'Peak Occupancy', value: '97%' },
      { label: 'Avg Nightly Rate', value: '€130' },
      { label: 'Properties Managed', value: '5+' },
      { label: 'Avg Guest Rating', value: '4.95' },
    ],
  },
};

export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const loc = slug ? LOCATIONS[slug] : undefined;

  if (!loc) {
    return (
      <>
        <Navbar />
        <main id="main" className="pt-20 section-container py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Location not found</h1>
          <Link to="/properties" className="text-primary text-sm hover:underline">← Browse Properties</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{loc.name} Property Management — Christiano Property Management</title>
        <meta
          name="description"
          content={`Professional short-let property management in ${loc.name}, Malta. Full-service management, transparent pricing, and guaranteed results.`}
        />
      </Helmet>
      <Navbar />
      <main id="main" className="pt-20">
        {/* Hero */}
        <section className="section-container py-16 md:py-24">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
            <MapPin size={11} /> Malta &amp; Gozo
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">{loc.headline}</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl mb-10">{loc.body}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {loc.stats.map((s) => (
              <div key={s.label} className="border border-border/50 p-4">
                <p className="text-2xl font-bold font-display mb-1">{s.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/owners/estimate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Get Free Estimate <ArrowRight size={13} />
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-[13px] font-medium hover:bg-accent transition-colors"
            >
              Browse {loc.name} Properties
            </Link>
          </div>
        </section>

        {/* Other locations */}
        <section className="section-container border-t border-border/25 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-6">Other Locations</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(LOCATIONS)
              .filter(([s]) => s !== slug)
              .map(([s, l]) => (
                <Link
                  key={s}
                  to={`/locations/${s}`}
                  className="px-4 py-2 border border-border/50 text-[12px] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  {l.name}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
