// Block renderers — pure presentational components driven by `data`.
// First pass: hero, text, stats, features, pricing, faq, testimonials,
// quote, image, gallery, cta, contact, divider, spacer.
import type { BuilderBlock } from "./types";

// sanitize strips HTML/JS from free-text fields before they are rendered.
// Reads textContent off a zero-width fabricated element — extracts only plain
// text, so every tag, attribute, and entity is neutralised without any
// external dependency.
function sanitize(v: unknown): string {
  const el = document.createElement("span");
  el.appendChild(document.createTextNode(String(v ?? "")));
  return el.textContent!;
}

function Hero({ d }: { d: Record<string, unknown> }) {
  const heading = sanitize(d.heading);
  return (
    <section className="px-12 py-20 text-center bg-gradient-to-b from-background to-muted/40">
      {d.eyebrow ? <div className="text-xs tracking-[0.22em] uppercase text-primary mb-5">{sanitize(d.eyebrow)}</div> : null}
      <h1
        className="font-serif text-5xl md:text-6xl font-light leading-tight"
      >{heading}</h1>
      {d.sub ? <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{sanitize(d.sub)}</p> : null}
      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        {d.btn1 ? <button className="px-7 py-3 bg-primary text-primary-foreground text-sm rounded-sm">{sanitize(d.btn1)}</button> : null}
        {d.btn2 ? <button className="px-7 py-3 border border-border text-sm rounded-sm">{sanitize(d.btn2)}</button> : null}
      </div>
    </section>
  );
}

function Text({ d }: { d: Record<string, unknown> }) {
  const align = (d.align as string) ?? "left";
  return (
    <section className="px-12 py-16" style={{ textAlign: align as "left" | "center" | "right" }}>
      {d.label ? <span className="text-[10px] tracking-[0.2em] uppercase text-primary mb-3 block">{sanitize(d.label)}</span> : null}
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-5">{sanitize(d.heading)}</h2> : null}
      {d.body ? <p className="text-muted-foreground leading-relaxed max-w-2xl">{sanitize(d.body)}</p> : null}
    </section>
  );
}

function Statsanitize({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { v: string; l: string }[]) ?? [];
  const cols  = (d.cols as number) ?? 4;
  return (
    <section className="px-12 py-12 bg-muted/30 border-y border-border">
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((st, i) => (
          <div key={i} className="text-center">
            <div className="font-serif text-5xl font-light text-primary">{sanitize(st.v)}</div>
            <div className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-2">{sanitize(st.l)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Featuresanitize({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { icon?: string; title: string; body: string }[]) ?? [];
  const cols  = (d.cols as number) ?? 2;
  return (
    <section className="px-12 py-16">
      {d.label ? <div className="text-[10px] tracking-[0.2em] uppercase text-primary mb-3">{sanitize(d.label)}</div> : null}
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{sanitize(d.heading)}</h2> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((f, i) => (
          <div key={i} className="p-6 bg-muted/40 border border-border rounded-md">
            {/* icon is a CSS class name — strip any script-like value before use as className */}
            {f.icon ? <i className={`ti ${sanitize(f.icon)}`} /> : null}
            <div className="font-serif text-xl mb-2">{sanitize(f.title)}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{sanitize(f.body)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ d }: { d: Record<string, unknown> }) {
  const plans = (d.plans as { name: string; pct: string; desc: string; feats: string[]; pop?: boolean }[]) ?? [];
  const cols  = Math.min(plans.length || 2, (d.cols as number) ?? 2);
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-2 text-center">{sanitize(d.heading)}</h2> : null}
      {d.note ? <p className="text-center text-muted-foreground mb-8">{sanitize(d.note)}</p> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {plans.map((p, i) => (
          <div key={i} className={`p-8 bg-muted/40 border rounded-md relative ${p.pop ? "border-primary" : "border-border"}`}>
            {p.pop ? <div className="absolute top-0 right-6 bg-primary text-primary-foreground text-[9px] tracking-widest uppercase px-3 py-1 rounded-b">Popular</div> : null}
            <div className="text-[10px] tracking-[0.16em] uppercase text-primary mb-2">{sanitize(p.name)}</div>
            <div><span className="font-serif text-5xl font-light">{sanitize(p.pct)}%</span> <span className="text-muted-foreground">commission</span></div>
            <p className="text-sm text-muted-foreground my-4">{sanitize(p.desc)}</p>
            <ul className="space-y-2 text-sm">{(p.feats ?? []).map((f, j) => <li key={j} className="text-muted-foreground">✓ {sanitize(f)}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-20 text-center bg-gradient-to-br from-muted/40 to-muted/60 border-y border-border">
      {d.heading ? <h2 className="font-serif text-5xl font-light mb-3">{sanitize(d.heading)}</h2> : null}
      {d.body ? <p className="text-muted-foreground max-w-xl mx-auto mb-8">{sanitize(d.body)}</p> : null}
      {d.btn ? <button className="px-10 py-3.5 bg-primary text-primary-foreground text-sm rounded-sm tracking-wider">{sanitize(d.btn)}</button> : null}
    </section>
  );
}

function ImageBlock({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-10">
      <img src={sanitize(d.url)} alt={sanitize(d.alt)} style={{ height: (d.height as number) ?? 360 }} className="w-full object-cover rounded-md" />
      {d.caption ? <div className="text-xs text-muted-foreground text-center mt-3">{sanitize(d.caption)}</div> : null}
    </section>
  );
}

function Gallery({ d }: { d: Record<string, unknown> }) {
  const imgs = (d.images as { url: string; alt?: string }[]) ?? [];
  const cols = (d.cols as number) ?? 3;
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-7">{sanitize(d.heading)}</h2> : null}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {imgs.map((img, i) => <img key={i} src={sanitize(img.url)} alt={sanitize(img.alt)} className="w-full h-44 object-cover rounded" />)}
      </div>
    </section>
  );
}

function Quote({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-20 py-16 text-center">
      <div className="font-serif text-6xl text-primary opacity-30 leading-none mb-4">&ldquo;</div>
      <blockquote className="font-serif text-2xl italic font-light">&ldquo;{sanitize(d.text)}&rdquo;</blockquote>
      {d.attr ? <cite className="text-xs tracking-widest uppercase text-primary mt-4 block not-italic">— {sanitize(d.attr)}</cite> : null}
    </section>
  );
}

function Contact({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{sanitize(d.heading)}</h2> : null}
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4 text-sm text-muted-foreground">
          {d.email   ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Email</div>{sanitize(d.email)}</div>     : null}
          {d.phone   ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Phone</div>{sanitize(d.phone)}</div>     : null}
          {d.address ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Location</div>{sanitize(d.address)}</div> : null}
        </div>
        <div className="space-y-2">
          {["Name *", "Email *", "Phone", "Message *"].map((p) => (
            <div key={p} className="px-4 py-3 bg-muted/40 border border-border rounded text-xs text-muted-foreground">{p}</div>
          ))}
          <button className="w-full px-6 py-3 bg-primary text-primary-foreground text-xs rounded">Send Message</button>
        </div>
      </div>
    </section>
  );
}

function FAQ({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { q: string; a: string }[]) ?? [];
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{sanitize(d.heading)}</h2> : null}
      <div className="divide-y divide-border">
        {items.map((f, i) => (
          <div key={i} className="py-5">
            <div className="font-serif text-lg">{sanitize(f.q)}</div>
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{sanitize(f.a)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonialsanitize({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { quote: string; name: string; loc: string; rating?: number }[]) ?? [];
  const cols  = (d.cols as number) ?? 2;
  return (
    <section className="px-12 py-16 bg-muted/30">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8 text-center">{sanitize(d.heading)}</h2> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((t, i) => (
          <div key={i} className="p-7 bg-background border border-border rounded-md">
            <div className="text-primary text-sm tracking-widest mb-3">{"★".repeat(Math.min(t.rating ?? 5, 5))}</div>
            <div className="font-serif italic text-lg text-muted-foreground mb-4">&ldquo;{sanitize(t.quote)}&rdquo;</div>
            <div className="text-sm">{sanitize(t.name)}</div>
            <div className="text-xs text-muted-foreground mt-1">{sanitize(t.loc)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Divider() { return <hr className="border-border mx-12" />; }
function Spacer({ d }: { d: Record<string, unknown> }) { return <div style={{ height: (d.height as number) ?? 48 }} />; }

function Placeholder({ type }: { type: string }) {
  return (
    <section className="px-12 py-12 border border-dashed border-border text-center text-muted-foreground">
      <div className="font-serif text-xl">{type}</div>
      <div className="text-xs mt-1">Renderer coming in next pass</div>
    </section>
  );
}

export function RenderBlock({ block }: { block: BuilderBlock }) {
  const d = block.data ?? {};
  switch (block.type) {
    case "hero":         return <Hero d={d} />;
    case "text":         return <Text d={d} />;
    case "stats":        return <Stats d={d} />;
    case "features":     return <Features d={d} />;
    case "pricing":      return <Pricing d={d} />;
    case "cta":          return <CTA d={d} />;
    case "image":        return <ImageBlock d={d} />;
    case "gallery":      return <Gallery d={d} />;
    case "quote":        return <Quote d={d} />;
    case "contact":      return <Contact d={d} />;
    case "faq":          return <FAQ d={d} />;
    case "testimonials": return <Testimonials d={d} />;
    case "divider":      return <Divider />;
    case "spacer":       return <Spacer d={d} />;
    default:             return <Placeholder type={block.type} />;
  }
}
