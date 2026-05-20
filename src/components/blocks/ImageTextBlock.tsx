import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ProgressiveImage from "@/components/ProgressiveImage";
import { sanitizeInput } from "@/lib/utils";

interface Props {
  data: ImageTextData;
  className?: string;
}

export default function ImageTextBlock({ data, className = "" }: Props) {
  const { heading, body, image, imagePosition = "right", cta } = data;
  const isLeft = imagePosition === "left";
  const sanitizedBody = sanitizeInput(body);

  return (
    <section className={`border-t border-border/30 py-16 ${className}`}>
      <div className="section-container">
        <div className={`grid items-center gap-12 lg:grid-cols-2 ${isLeft ? "" : ""}`}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`${isLeft ? "lg:order-1" : "lg:order-2"}`}
          >
            <div className="satin-surface overflow-hidden rounded-2xl">
              <ProgressiveImage
                src={image}
                alt={heading.headline}
                width={600}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${isLeft ? "lg:order-2" : "lg:order-1"}`}
          >
            <SectionHeading data={{ ...heading, alignment: "left" }} className="mb-6" />
            <p className="mb-8 leading-relaxed text-muted-foreground">{sanitizedBody}</p>
            {cta && (
              <Link
                to={cta.href}
                className="inline-flex items-center gap-2 rounded bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {cta.label} <ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
