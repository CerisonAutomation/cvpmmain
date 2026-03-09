import SectionHeading from './SectionHeading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQAccordionData } from '@/lib/cms/types';

interface Props {
  data: FAQAccordionData;
}

export default function FAQAccordionBlock({ data }: Props) {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-container max-w-3xl">
        <SectionHeading data={data.heading} className="mb-12" />

        <Accordion type="single" collapsible className="space-y-2">
          {data.items.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="satin-surface rounded-md px-5 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-serif text-sm font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
