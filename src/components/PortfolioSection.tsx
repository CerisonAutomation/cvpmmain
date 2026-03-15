import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, BedDouble, Bath, ArrowRight } from "lucide-react";
import propertyFives from "@/assets/property-fives.jpg";
import propertyUrsula from "@/assets/property-ursula.jpg";
import propertyPenthouse from "@/assets/property-penthouse.jpg";

const PROPERTIES = [
  { img: propertyFives,     title: "The Fives Apartments",   location: "St Julian's, Malta",  type: "Apartment",  guests: 6, beds: 3, baths: 3, price: "€180" },
  { img: propertyUrsula,    title: "123 St Ursula Street",    location: "Valletta, Malta",      type: "Apartment",  guests: 4, beds: 1, baths: 2, price: "€150" },
  { img: propertyPenthouse, title: "St. Julian's Penthouse",  location: "San Ġiljan, Malta",   type: "Penthouse",  guests: 4, beds: 2, baths: 2, price: "€155" },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-16 sm:py-24 bg-card/30 relative overflow-hidden">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="section-container relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="micro-type text-primary mb-4">Our Properties</p>
          <h2 className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Currently Managed
          </h2>
          <div className="mx-auto mt-4 mb-5 h-[1px]" style={{ width: 'clamp(4rem,10vw,8rem)', background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2),transparent)' }} />
          <p className="text-body text-muted-foreground max-w-md mx-auto">
            Each property is styled and managed to five-star standards. Book directly — no platform fees.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPERTIES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="property-card card-gold-border group"
            >
              <div className="property-image-container aspect-property">
                <img src={p.img} alt={p.title} className="property-image" loading="lazy" />
                <span className="absolute top-3 right-3 px-2.5 py-1 glass micro-type text-primary" style={{ fontSize: '0.6rem', zIndex: 2 }}>
                  from {p.price}/night
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{p.title}</h3>
                <p className="text-small text-muted-foreground mb-4">{p.location} · {p.type}</p>
                <div className="flex items-center gap-4 text-small text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Users size={12} /> {p.guests} guests</span>
                  <span className="flex items-center gap-1.5"><BedDouble size={12} /> {p.beds} bed</span>
                  <span className="flex items-center gap-1.5"><Bath size={12} /> {p.baths} bath</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/properties" className="btn-outline inline-flex items-center gap-3 group">
            View All Properties
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
