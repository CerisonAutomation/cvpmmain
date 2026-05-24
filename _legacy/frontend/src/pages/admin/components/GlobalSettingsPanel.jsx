import { useState, useEffect } from "react";
import { useCMS } from "@/context/CMSContext";
import { toast } from "sonner";
import { Save, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const Field = ({ label, value, onChange, type = "text", placeholder = "", rows }) => (
  <div className="mb-3">
    <label className="block text-[9px] uppercase tracking-widest text-[#D4AF37] mb-1">{label}</label>
    {rows ? (
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0b] border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1.5 focus:border-[#D4AF37] outline-none resize-none"
      />
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0b] border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1.5 focus:border-[#D4AF37] outline-none"
      />
    )}
  </div>
);

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#1a1a1e] mb-2">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-[#f0ede8] hover:bg-[#1a1a1e] transition-colors">
        <span>{title}</span>
        {open ? <ChevronDown className="w-3 h-3 text-[#D4AF37]" /> : <ChevronRight className="w-3 h-3 text-[#6a6a6e]" />}
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
};

const NavItemEditor = ({ items, onChange }) => {
  const update = (i, key, val) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [key]: val } : item);
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { icon: "MapPin", label: "New Item", desc: "", href: "/" }]);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-[#0a0a0b] border border-[#1a1a1e] p-2 space-y-1.5">
          <div className="flex gap-1.5">
            <input value={item.label || ""} onChange={e => update(i, "label", e.target.value)} placeholder="Label" className="flex-1 bg-transparent border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
            <input value={item.icon || ""} onChange={e => update(i, "icon", e.target.value)} placeholder="Icon" className="w-20 bg-transparent border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
            <button onClick={() => remove(i)} className="p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="w-3 h-3" /></button>
          </div>
          <input value={item.desc || ""} onChange={e => update(i, "desc", e.target.value)} placeholder="Description" className="w-full bg-transparent border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
          <div className="flex gap-1.5">
            <input value={item.href || ""} onChange={e => update(i, "href", e.target.value)} placeholder="URL (e.g. /properties)" className="flex-1 bg-transparent border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
            <input value={item.action || ""} onChange={e => update(i, "action", e.target.value)} placeholder="Action (optional)" className="w-28 bg-transparent border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-[#2a2a2e] text-[#6a6a6e] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 text-xs transition-colors">
        <Plus className="w-3 h-3" /> Add Item
      </button>
    </div>
  );
};

const LinkListEditor = ({ items, onChange }) => {
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: "New Link", href: "/" }]);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <input value={item.label || ""} onChange={e => update(i, "label", e.target.value)} placeholder="Label" className="flex-1 bg-[#0a0a0b] border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
          <input value={item.href || ""} onChange={e => update(i, "href", e.target.value)} placeholder="URL or action" className="flex-1 bg-[#0a0a0b] border border-[#1a1a1e] text-[#f0ede8] text-xs px-2 py-1 focus:border-[#D4AF37] outline-none" />
          <button onClick={() => remove(i)} className="p-1 text-red-500 hover:bg-red-500/10"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <button onClick={add} className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-[#2a2a2e] text-[#6a6a6e] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 text-xs transition-colors">
        <Plus className="w-3 h-3" /> Add Link
      </button>
    </div>
  );
};

export const GlobalSettingsPanel = () => {
  const { cms, updateSection } = useCMS();
  const [saving, setSaving] = useState(null);

  const [brand, setBrand] = useState(cms.brand || {});
  const [contact, setContact] = useState(cms.contact || {});
  const [nav, setNav] = useState(cms.nav || { ownerItems: [], bookingItems: [] });
  const [footer, setFooter] = useState(cms.footer || { guestLinks: [], ownerLinks: [], social: {} });
  const [modals, setModals] = useState(cms.modals || { contact: {}, owner: {} });

  // Sync when CMS loads from DB
  useEffect(() => { setBrand(cms.brand || {}); }, [cms.brand]);
  useEffect(() => { setContact(cms.contact || {}); }, [cms.contact]);
  useEffect(() => { setNav(cms.nav || { ownerItems: [], bookingItems: [] }); }, [cms.nav]);
  useEffect(() => { setFooter(cms.footer || { guestLinks: [], ownerLinks: [], social: {} }); }, [cms.footer]);
  useEffect(() => { setModals(cms.modals || { contact: {}, owner: {} }); }, [cms.modals]);

  const save = async (section, data, label) => {
    setSaving(section);
    const ok = await updateSection(section, data);
    setSaving(null);
    if (ok) toast.success(`${label} saved`);
    else toast.error(`Failed to save ${label}`);
  };

  const SaveBtn = ({ section, data, label }) => (
    <button
      onClick={() => save(section, data, label)}
      disabled={saving === section}
      className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#0a0a0b] text-[10px] font-semibold hover:bg-[#E5C158] disabled:opacity-50 transition-colors"
    >
      <Save className="w-3 h-3" />
      {saving === section ? "Saving…" : "Save"}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0b]">
      <p className="text-[9px] text-[#4a4a4e] uppercase tracking-widest mb-4">Global Site Settings</p>

      {/* BRAND */}
      <Section title="Brand" defaultOpen>
        <Field label="Site Name" value={brand.name} onChange={v => setBrand(b => ({ ...b, name: v }))} />
        <Field label="Tagline" value={brand.tagline} onChange={v => setBrand(b => ({ ...b, tagline: v }))} />
        <Field label="Logo URL (White/Dark BG)" value={brand.logoWhite} onChange={v => setBrand(b => ({ ...b, logoWhite: v }))} placeholder="https://..." />
        <Field label="Logo URL (Gold/Light BG)" value={brand.logoGold} onChange={v => setBrand(b => ({ ...b, logoGold: v }))} placeholder="https://..." />
        <Field label="Favicon URL" value={brand.favicon} onChange={v => setBrand(b => ({ ...b, favicon: v }))} placeholder="https://..." />
        <SaveBtn section="brand" data={brand} label="Brand" />
      </Section>

      {/* CONTACT */}
      <Section title="Contact Info" defaultOpen>
        <Field label="Phone" value={contact.phone} onChange={v => setContact(c => ({ ...c, phone: v }))} placeholder="+356 7979 0202" />
        <Field label="Email" value={contact.email} onChange={v => setContact(c => ({ ...c, email: v }))} placeholder="info@..." />
        <Field label="WhatsApp (digits only)" value={contact.whatsapp} onChange={v => setContact(c => ({ ...c, whatsapp: v }))} placeholder="35679790202" />
        <Field label="Address" value={contact.address} onChange={v => setContact(c => ({ ...c, address: v }))} />
        <Field label="Office Hours" value={contact.officeHours} onChange={v => setContact(c => ({ ...c, officeHours: v }))} />
        <SaveBtn section="contact" data={contact} label="Contact" />
      </Section>

      {/* NAVIGATION */}
      <Section title="Navigation — For Owners Dropdown">
        <p className="text-[9px] text-[#5a5a5e] mb-2">Icons: Award, DollarSign, Users, Camera, Building, Home, Map, MapPin, Calendar</p>
        <NavItemEditor items={nav.ownerItems || []} onChange={items => setNav(n => ({ ...n, ownerItems: items }))} />
        <div className="mt-2">
          <p className="text-[9px] text-[#6a6a6e] font-semibold uppercase tracking-widest mb-1 mt-3">Book a Stay Dropdown</p>
          <NavItemEditor items={nav.bookingItems || []} onChange={items => setNav(n => ({ ...n, bookingItems: items }))} />
        </div>
        <div className="mt-2"><SaveBtn section="nav" data={nav} label="Navigation" /></div>
      </Section>

      {/* FOOTER */}
      <Section title="Footer Links">
        <p className="text-[9px] text-[#5a5a5e] mb-1">Guest Links</p>
        <LinkListEditor items={footer.guestLinks || []} onChange={links => setFooter(f => ({ ...f, guestLinks: links }))} />
        <p className="text-[9px] text-[#5a5a5e] mb-1 mt-3">Owner Links</p>
        <LinkListEditor items={footer.ownerLinks || []} onChange={links => setFooter(f => ({ ...f, ownerLinks: links }))} />
        <p className="text-[9px] text-[#5a5a5e] mb-1 mt-3">Social URLs</p>
        <Field label="Instagram URL" value={footer.social?.instagram} onChange={v => setFooter(f => ({ ...f, social: { ...f.social, instagram: v } }))} />
        <Field label="Facebook URL" value={footer.social?.facebook} onChange={v => setFooter(f => ({ ...f, social: { ...f.social, facebook: v } }))} />
        <SaveBtn section="footer" data={footer} label="Footer" />
      </Section>

      {/* MODALS */}
      <Section title="Contact Modal Copy">
        <Field label="Title" value={modals.contact?.title} onChange={v => setModals(m => ({ ...m, contact: { ...m.contact, title: v } }))} />
        <Field label="Subtitle" value={modals.contact?.subtitle} onChange={v => setModals(m => ({ ...m, contact: { ...m.contact, subtitle: v } }))} />
        <Field label="Success Title" value={modals.contact?.successTitle} onChange={v => setModals(m => ({ ...m, contact: { ...m.contact, successTitle: v } }))} />
        <Field label="Success Text" value={modals.contact?.successText} onChange={v => setModals(m => ({ ...m, contact: { ...m.contact, successText: v } }))} rows={2} />
        <Field label="Subjects (comma-separated)" value={(modals.contact?.subjects || []).join(", ")} onChange={v => setModals(m => ({ ...m, contact: { ...m.contact, subjects: v.split(",").map(s => s.trim()).filter(Boolean) } }))} />
        <SaveBtn section="modals" data={modals} label="Modals" />
      </Section>

      <Section title="Owner Modal Copy">
        <Field label="Title" value={modals.owner?.title} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, title: v } }))} />
        <Field label="Success Title" value={modals.owner?.successTitle} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, successTitle: v } }))} />
        <Field label="Success Text" value={modals.owner?.successText} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, successText: v } }))} rows={2} />
        <Field label="Step 1 Description" value={modals.owner?.step1Desc} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, step1Desc: v } }))} />
        <Field label="Step 2 Description" value={modals.owner?.step2Desc} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, step2Desc: v } }))} />
        <Field label="Step 3 Description" value={modals.owner?.step3Desc} onChange={v => setModals(m => ({ ...m, owner: { ...m.owner, step3Desc: v } }))} />
        <SaveBtn section="modals" data={modals} label="Modals" />
      </Section>
    </div>
  );
};
