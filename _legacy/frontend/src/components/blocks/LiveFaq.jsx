import { memo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InlineText } from "./InlineText";

export const LiveFaq = memo(({ d, onEdit }) => {
  const items = d.items || d.faqs || [];
  return (
    <section className="py-20 bg-[#161618]" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <InlineText value={d.title || "Frequently Asked Questions"} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl text-[#F5F5F0] text-center mb-10" />
        <Accordion type="single" collapsible className="space-y-2">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-white/10 px-4">
              <AccordionTrigger className="text-[#F5F5F0] text-left hover:no-underline">
                {item.q || item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#A1A1AA] text-sm leading-relaxed">
                {item.a || item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
});
