import Layout from '@/components/Layout';
import PricingSection from '@/components/PricingSection';
import WizardModal from '@/components/WizardModal';
import { useState } from 'react';

export default function PricingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <Layout>
      <section className="py-8">
        <PricingSection onOpenWizard={() => setWizardOpen(true)} />
      </section>
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </Layout>
  );
}
