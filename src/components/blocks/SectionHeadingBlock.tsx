import SectionHeading from './SectionHeading';
import type { SectionHeadingData } from '@/lib/cms/types';

interface Props {
  data: SectionHeadingData;
  className?: string;
}

export default function SectionHeadingBlock({ data, className = '' }: Props) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="section-container">
        <SectionHeading data={data} />
      </div>
    </section>
  );
}
