import { memo } from "react";
import { ImageIcon } from "lucide-react";

export const LiveImage = memo(({ d }) => (
  <div className="py-8 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
      {d.src ? (
        <figure>
          <img src={d.src} alt={d.alt || ""} className={`w-full ${d.aspectRatio === "16:9" ? "aspect-video" : d.aspectRatio === "4:3" ? "aspect-[4/3]" : d.aspectRatio === "1:1" ? "aspect-square" : d.aspectRatio === "3:4" ? "aspect-[3/4]" : ""} object-cover`} />
          {d.caption && <figcaption className="text-center text-sm text-[#A1A1AA] mt-4">{d.caption}</figcaption>}
        </figure>
      ) : (
        <div className="aspect-video bg-[#161618] flex items-center justify-center text-[#A1A1AA]">
          <ImageIcon className="w-12 h-12 opacity-30" />
        </div>
      )}
    </div>
  </div>
));
