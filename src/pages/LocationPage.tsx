import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Star, ArrowRight, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import LeadModal from '@/components/LeadModal';

const LOCATIONS: Record<string, { title: string; area: string; hero: string; description: string; highlights: string[]; avgNightly: string; avgRating: string; propertyCount: string }> = {
  'st-julians': {
    title: "St Julian's", area: 'Malta\'s Entertainment Hub', hero: 'Malta\'s most vibrant neighbourhood — packed with restaurants, bars, and the famous Paceville strip, yet with calmer residential pockets perfect for holiday rentals.',
    description: "St Julian's offers the widest range of short-stay properties in Malta, from sleek seafront penthouses to spacious family apartments. It's the top choice for travellers who want to be at the centre of the action — walkable to Spinola Bay, St George's Bay, and the best restaurants on the island.",
    highlights: ['Steps to Spinola Bay promenade', 'Malta\'s best restaurant and bar scene', '10 minutes from Valletta by bus', 'High year-round demand from both leisure and corporate guests', 'Average nightly rates 15% above island median'],
    avgNightly: '€155', avgRating: '4.97', propertyCount: '12',
  },
  'valletta': {
    title: 'Valletta', area: 'UNESCO Capital City', hero: 'Europe\'s smallest capital and one of its most extraordinary — a living Baroque city where every street is a postcard. Short-stays here command a significant premium.',
    description: 'Valletta properties are among the most sought-after on the island, attracting cultural travellers, heritage enthusiasts, and couples seeking a romantic city break. The tight supply of high-quality rentals means strong occupancy and excellent yields for well-maintained properties.',
    highlights: ['UNESCO World Heritage Site', 'Walking distance to Grand Harbour', 'Year-round cultural events and festivals', 'Premium pricing — highest ADR in Malta', 'Growing direct booking demand from international travellers'],
    avgNightly: '€145', avgRating: '4.96', propertyCount: '8',
  },
  'sliema': {
    title: 'Sliema', area: 'Waterfront Shopping & Lifestyle', hero: 'Sliema is Malta\'s cosmopolitan hub — a long seafront promenade, the island\'s best shopping, and a broad mix of property types from vintage townhouses to modern penthouses.',
    description: 'With its seafront esplanade, shopping centres, and excellent transport links, Sliema attracts a diverse mix of guests: young professionals, families, and longer-stay visitors. Properties here offer strong mid-range performance and consistent year-round bookings.',
    highlights: ['1.5km seafront walking promenade', 'Malta\'s best shopping and dining', 'Ferries to Valletta every 20 minutes', 'Strong corporate and relocation market', 'Good entry-point yields for new investors'],
    avgNightly: '€135', avgRating: '4.95', propertyCount: '9',
  },
  'mellieha': {
    title: 'Mellieħa', area: 'Northern Malta & Gozo Gateway', hero: 'Mellieħa is Malta\'s family favourite — home to the island\'s largest sandy beach and a gateway to rural north Malta and Gozo ferries.',
    description: 'Mellieħa properties attract families and couples who want natural beauty over nightlife. Demand peaks sharply in summer with beach visitors, and the area attracts growing off-season interest from walkers, cyclists, and Gozo day-trippers.',
    highlights: ['Mellieħa Bay — Malta\'s largest sandy beach', 'Gozo ferry 15 minutes away', 'Quieter, nature-focused location', 'Strong summer peak demand', 'High family group bookings — longer stays'],
    avgNightly: '€125', avgRating: '4.94', propertyCount: '5',
  },
  'gozo': {
    title: 'Gozo', area: 'The Sister Island', hero: 'Gozo is Malta\'s slower, greener sister island — a growing short-stay market attracting travellers seeking authenticity, diving, and escape from city pace.',
    description: "Gozo's short-stay market has grown dramatically in recent years as the island gains recognition among European travellers. Properties here are still significantly underpriced relative to their potential, making now an excellent time to invest or list.",
    highlights: ['Fastest growing short-stay market in the Maltese islands', 'World-class diving and water sports', 'Authentic character properties and farmhouses', 'Strong spring and autumn shoulder season', 'Average listing price 40% below Malta mainland'],
    avgNightly: '€110', avgRating: '4.95', propertyCount: '4',
  },
};

export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [leadOpen, setLeadOpen] = useState(false);
  const loc = slug ? LOCATIONS[slug] : null;

  if (!loc) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onOpenWizard={() => setLeadOpen(true)} />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 py-40">
        <MapPin className="w-10 h-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Location not found</h1>
        <Link to="/properties" className="btn-primary">View All Properties</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title={`${loc.title} Holiday Rentals — Christiano Vincenti Malta`}
        description={`Handpicked short-stay properties in ${loc.title}, Malta. ${loc.description.slice(0, 120)}…`}
        keywords={[`${loc.title} holiday rentals`, `${loc.title} Malta apartments`, `short stay ${loc.title}`]}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to="/properties" className="hover:text-primary">Properties</Link>
                <span>/</span>
                <span className="text-foreground">{loc.title}</span>
              </div>
              <p className="micro-type text-primary mb-2">{loc.area}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] mb-4">{loc.title}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">{loc.hero}</p>
            </FadeInView>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-10 border-b border-border/20 bg-muted/20">
          <div className="section-container">
            <div className="grid grid-cols-3 gap-8 max-w-lg">
              <div className="text-center"><p className="text-2xl font-bold text-primary">{loc.avgNightly}</p><p className="text-xs text-muted-foreground mt-1">Avg per night</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-primary">{loc.avgRating} ★</p><p className="text-xs text-muted-foreground mt-1">Avg rating</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-primary">{loc.propertyCount}</p><p className="text-xs text-muted-foreground mt-1">Properties</p></div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-16">
              <FadeInView>
                <h2 className="text-2xl font-bold mb-4">Why {loc.title}?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{loc.description}</p>
                <ul className="space-y-3">
                  {loc.highlights.map(h => (
                    <li key={h} className="flex items-start gap-3">
                      <Star size={14} className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              </FadeInView>
              <FadeInView delay={0.15}>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 space-y-5">
                  <Home className="w-8 h-8 text-primary" />
                  <h3 className="font-semibold text-lg">Own a property in {loc.title}?</h3>
                  <p className="text-sm text-muted-foreground">We manage {loc.propertyCount} properties here and know the market intimately. Get a personalised income estimate in 24 hours.</p>
                  <button onClick={() => setLeadOpen(true)} className="btn-primary w-full">Get Free Income Estimate</button>
                  <Link to="/properties" className="btn-secondary w-full flex items-center justify-center gap-2">
                    View {loc.title} Listings <ArrowRight size={14} />
                  </Link>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="owner" />
    </div>
  );
}
