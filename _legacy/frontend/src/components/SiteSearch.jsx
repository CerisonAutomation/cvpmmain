import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export function SiteSearch({ className = "" }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/properties?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submit} className={`flex items-center gap-2 ${className}`}>
      <Search className="w-4 h-4 text-[#A1A1AA] shrink-0" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search properties…"
        className="bg-transparent border-b border-[#27272A] text-sm text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#D4AF37] outline-none w-32 md:w-48"
        aria-label="Search properties"
      />
    </form>
  );
}
