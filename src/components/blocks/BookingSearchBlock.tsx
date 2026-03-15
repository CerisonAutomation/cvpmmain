import BookingSearchBar from '@/components/BookingSearchBar';
import type { BookingSearchData } from '@/lib/cms/types';

interface Props {
  data: BookingSearchData;
}

export default function BookingSearchBlock({ data }: Props) {
  return (
    <section className="relative z-10 -mt-4 pb-6">
      <div className="section-container">
        <BookingSearchBar variant={data.variant} />
      </div>
    </section>
  );
}
