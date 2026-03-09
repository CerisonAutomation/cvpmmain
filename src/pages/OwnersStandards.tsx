/**
 * Owners Standards Page — CMS-Driven with Realtime DB Sync
 */

import { motion } from 'framer-motion';
import { Gift, MessageCircle, Camera, TrendingUp, BedDouble, SprayCan, ShieldCheck, Wrench, FileBarChart, LayoutDashboard, CalendarCheck, BarChart3 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCmsPage } from '@/hooks/use-cms-page';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { ContentBlock } from '@/lib/cms/types';

export default function OwnersStandards() {
  const { page } = useCmsPage('standards');

  if (!page) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Page content not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {page.blocks.map((block: ContentBlock) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </Layout>
  );
}
