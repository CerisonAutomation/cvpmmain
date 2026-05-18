// Block renderers — pure presentational components driven by `data`.
// First pass: hero, text, stats, features, pricing, faq, testimonials,
// quote, image, gallery, cta, contact, divider, spacer.
import DOMPurify from "dompurify";
import type { BuilderBlock } from "./types";

const esc = (v: unknown) => (v == null ? "" : String(v));

function Hero({ d }: { d: Record<string, unknown> }) {
  const heading = esc(d.heading);
  // FIX #4: was dangerouslySetInnerHTML={{ __html: heading }} — stored XSS via builder_blocks.data
  // Now sanitized with DOMPurify before injection
  const sanitized = DOMPurify.sanitize(heading);
  return (
    <section className="px-12 py-20 text-center bg-gradient-to-b from-background to-muted/40">
      {d.eyebrow ? <div className="text-xs tracking-[0.22em] uppercase text-primary mb-5">{esc(d.eyebrow)}</div> : null}
      <h1
        className="font-serif text-5xl md:text-6xl font-light leading-tight"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
      {d.sub ? <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{esc(d.sub)}</p> : null}
      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        {d.btn1 ? <button className="px-7 py-3 bg-primary text-primary-foreground text-sm rounded-sm">{esc(d.btn1)}</button> : null}
        {d.btn2 ? <button className="px-7 py-3 border border-border text-sm rounded-sm">{esc(d.btn2)}</button> : null}
      </div>
    </section>
  );
}

function Text({ d }: { d: Record<string, unknown> }) {
  const align = (d.align as string) ?? "left";
  return (
    <section className="px-12 py-16" style={{ textAlign: align as "left" | "center" | "right" }}>
      {d.label ? <span className="text-[10px] tracking-[0.2em] uppercase text-primary mb-3 block">{esc(d.label)}</span> : null}
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-5">{esc(d.heading)}</h2> : null}
      {d.body ? <p className="text-muted-foreground leading-relaxed max-w-2xl">{esc(d.body)}</p> : null}
    </section>
  );
}

function Stats({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { v: string; l: string }[]) ?? [];
  const cols  = (d.cols as number) ?? 4;
  return (
    <section className="px-12 py-12 bg-muted/30 border-y border-border">
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((s, i) => (
          <div key={i} className="text-center">
            <div className="font-serif text-5xl font-light text-primary">{esc(s.v)}</div>
            <div className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-2">{esc(s.l)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { icon?: string; title: string; body: string }[]) ?? [];
  const cols  = (d.cols as number) ?? 2;
  return (
    <section className="px-12 py-16">
      {d.label ? <div className="text-[10px] tracking-[0.2em] uppercase text-primary mb-3">{esc(d.label)}</div> : null}
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{esc(d.heading)}</h2> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((f, i) => (
          <div key={i} className="p-6 bg-muted/40 border border-border rounded-md">
            <div className="font-serif text-xl mb-2">{esc(f.title)}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{esc(f.body)}</div>
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
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-2 text-center">{esc(d.heading)}</h2> : null}
      {d.note ? <p className="text-center text-muted-foreground mb-8">{esc(d.note)}</p> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {plans.map((p, i) => (
          <div key={i} className={`p-8 bg-muted/40 border rounded-md relative ${p.pop ? "border-primary" : "border-border"}`}>
            {p.pop ? <div className="absolute top-0 right-6 bg-primary text-primary-foreground text-[9px] tracking-widest uppercase px-3 py-1 rounded-b">Popular</div> : null}
            <div className="text-[10px] tracking-[0.16em] uppercase text-primary mb-2">{esc(p.name)}</div>
            <div><span className="font-serif text-5xl font-light">{esc(p.pct)}%</span> <span className="text-muted-foreground">commission</span></div>
            <p className="text-sm text-muted-foreground my-4">{esc(p.desc)}</p>
            <ul className="space-y-2 text-sm">{(p.feats ?? []).map((f, j) => <li key={j} className="text-muted-foreground">✓ {esc(f)}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-20 text-center bg-gradient-to-br from-muted/40 to-muted/60 border-y border-border">
      {d.heading ? <h2 className="font-serif text-5xl font-light mb-3">{esc(d.heading)}</h2> : null}
      {d.body ? <p className="text-muted-foreground max-w-xl mx-auto mb-8">{esc(d.body)}</p> : null}
      {d.btn ? <button className="px-10 py-3.5 bg-primary text-primary-foreground text-sm rounded-sm tracking-wider">{esc(d.btn)}</button> : null}
    </section>
  );
}

function ImageBlock({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-10">
      <img src={esc(d.url)} alt={esc(d.alt)} style={{ height: (d.height as number) ?? 360 }} className="w-full object-cover rounded-md" />
      {d.caption ? <div className="text-xs text-muted-foreground text-center mt-3">{esc(d.caption)}</div> : null}
    </section>
  );
}

function Gallery({ d }: { d: Record<string, unknown> }) {
  const imgs = (d.images as { url: string; alt?: string }[]) ?? [];
  const cols = (d.cols as number) ?? 3;
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-7">{esc(d.heading)}</h2> : null}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {imgs.map((img, i) => <img key={i} src={img.url} alt={esc(img.alt)} className="w-full h-44 object-cover rounded" />)}
      </div>
    </section>
  );
}

function Quote({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-20 py-16 text-center">
      <div className="font-serif text-6xl text-primary opacity-30 leading-none mb-4">&ldquo;</div>
      <blockquote className="font-serif text-2xl italic font-light">&ldquo;{esc(d.text)}&rdquo;</blockquote>
      {d.attr ? <cite className="text-xs tracking-widest uppercase text-primary mt-4 block not-italic">— {esc(d.attr)}</cite> : null}
    </section>
  );
}

function Contact({ d }: { d: Record<string, unknown> }) {
  return (
    <section className="px-12 py-16">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{esc(d.heading)}</h2> : null}
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4 text-sm text-muted-foreground">
          {d.email   ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Email</div>{esc(d.email)}</div>     : null}
          {d.phone   ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Phone</div>{esc(d.phone)}</div>     : null}
          {d.address ? <div><div className="text-[9px] uppercase tracking-widest text-muted-foreground/70">Location</div>{esc(d.address)}</div> : null}
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
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8">{esc(d.heading)}</h2> : null}
      <div className="divide-y divide-border">
        {items.map((f, i) => (
          <div key={i} className="py-5">
            <div className="font-serif text-lg">{esc(f.q)}</div>
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{esc(f.a)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ d }: { d: Record<string, unknown> }) {
  const items = (d.items as { quote: string; name: string; loc: string; rating?: number }[]) ?? [];
  const cols  = (d.cols as number) ?? 2;
  return (
    <section className="px-12 py-16 bg-muted/30">
      {d.heading ? <h2 className="font-serif text-4xl font-light mb-8 text-center">{esc(d.heading)}</h2> : null}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {items.map((t, i) => (
          <div key={i} className="p-7 bg-background border border-border rounded-md">
            <div className="text-primary text-sm tracking-widest mb-3">{"★".repeat(Math.min(t.rating ?? 5, 5))}</div>
            <div className="font-serif italic text-lg text-muted-foreground mb-4">&ldquo;{esc(t.quote)}&rdquo;</div>
            <div className="text-sm">{esc(t.name)}</div>
            <div className="text-xs text-muted-foreground mt-1">{esc(t.loc)}</div>
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
