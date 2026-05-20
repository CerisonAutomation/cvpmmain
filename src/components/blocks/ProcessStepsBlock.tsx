import { motion } from "framer-motion";
import { ClipboardCheck, Camera, Rocket, type LucideIcon } from "lucide-react";
import SectionHeading from "./SectionHeading";
import type { ProcessStepsData } from "@/lib/cms/types";

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardCheck,
  Camera,
  Rocket,
};

interface Props {
  data: ProcessStepsData;
}

export default function ProcessStepsBlock({ data }: Props) {
  return (
    <section className="py-16 sm:py-20" role="region" aria-labelledby="process-heading">
      <div className="section-container">
        <SectionHeading data={data.heading} className="mb-12" />

        <div className="grid gap-5 md:grid-cols-3" role="list">
          {data.steps.map((step, i) => {
            const Icon = ICON_MAP[step.icon || "ClipboardCheck"] || ClipboardCheck;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="satin-surface group relative rounded-md p-6"
                role="listitem"
              >
                <span
                  className="absolute right-5 top-5 select-none font-serif text-4xl font-bold text-border/40"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                  <Icon size={18} className="text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
