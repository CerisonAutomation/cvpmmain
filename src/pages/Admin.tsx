// Admin page - simplified until SiteConfig is extended
import { useState } from "react";
import Layout from "@/components/Layout";
import { COMPANY_INFO, DEFAULT_PLANS, DEFAULT_FAQS } from "@/lib/site-config";

export default function Admin() {
  const [tab, setTab] = useState<'company' | 'plans' | 'faqs'>('company');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold mb-8">Site Admin</h1>
        
        <div className="flex gap-2 mb-8">
          {(['company', 'plans', 'faqs'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'company' && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Company Info</h2>
            {Object.entries(COMPANY_INFO).map(([key, value]) => (
              <div key={key} className="flex gap-4 items-center">
                <label className="w-32 text-sm font-medium capitalize">{key}</label>
                <input defaultValue={value} className="flex-1 px-3 py-2 border rounded-lg text-sm" readOnly />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Edit site-config.ts to update company information.</p>
          </div>
        )}

        {tab === 'plans' && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Pricing Plans</h2>
            {DEFAULT_PLANS.map((plan, i) => (
              <div key={i} className="p-4 border rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <span className="text-primary font-bold">{plan.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {plan.features.map((f, j) => <li key={j}>• {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">FAQs</h2>
            {DEFAULT_FAQS.map((faq, i) => (
              <div key={i} className="p-4 border rounded-xl">
                <h3 className="font-semibold text-sm mb-1">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
