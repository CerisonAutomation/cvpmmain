import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Calendar, Star, Wrench, Download, TrendingUp, Home, LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import { supabase } from '@/integrations/supabase/client';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'reservations', label: 'Reservations', icon: Calendar },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
] as const;

type Tab = typeof TABS[number]['id'];

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <Icon size={14} className="text-primary" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/owner-portal` } });
    setLoading(false);
    if (!error) setSent(true);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-card border border-border/30 rounded-2xl shadow-xl">
        <LogIn className="w-8 h-8 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-1">Owner Portal</h2>
        <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a secure login link.</p>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-sm font-medium">Check your inbox!</p>
            <p className="text-xs text-muted-foreground mt-1">A magic link has been sent to {email}</p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send Login Link'}
            </button>
          </form>
        )}
        <p className="text-xs text-center text-muted-foreground mt-4">Access is restricted to registered property owners. <Link to="/contact" className="text-primary">Contact us</Link> to register.</p>
      </div>
    </div>
  );
}

export default function OwnerPortalPage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Owner Portal — Christiano Vincenti Property Management"
        description="Secure owner dashboard. View your property performance, statements, reservations, reviews, and maintenance reports."
        keywords={['Malta property owner portal', 'owner statement Malta', 'property management dashboard Malta']}
        noIndex
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content" className="pt-20">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !session ? (
          <LoginPrompt onLogin={() => {}} />
        ) : (
          <div className="section-container py-12">
            <FadeInView>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="micro-type text-primary mb-1">Owner Portal</p>
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">{session.user.email}</p>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary flex items-center gap-2 text-sm"><Download size={14} />Download Statement</button>
                  <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign out</button>
                </div>
              </div>
            </FadeInView>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border/30 mb-8 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                  <tab.icon size={14} />{tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <FadeInView>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  <StatCard label="This Month Payout" value="€3,533" sub="Nov 2025" icon={TrendingUp} />
                  <StatCard label="Occupancy" value="59%" sub="vs 61% last month" icon={Calendar} />
                  <StatCard label="Avg Rating" value="4.97 ★" sub="Based on 24 reviews" icon={Star} />
                  <StatCard label="Properties" value="1" sub="Active listings" icon={Home} />
                </div>
                <div className="bg-card border border-border/30 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Monthly Performance — Last 6 Months</h3>
                  <div className="flex items-end gap-2 h-32">
                    {[62, 48, 71, 59, 65, 59].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-primary/80 rounded-t" style={{ height: `${val * 1.2}%` }} />
                        <span className="text-xs text-muted-foreground">{['Jun','Jul','Aug','Sep','Oct','Nov'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInView>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <FadeInView>
                <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-border/20">
                    <h3 className="font-semibold">Recent Reservations</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {[{ guest: 'Guest from UK', dates: '12–16 Nov', nights: 4, channel: 'Airbnb', total: '€620' },
                      { guest: 'Guest from Germany', dates: '8–12 Nov', nights: 4, channel: 'Booking.com', total: '€580' },
                      { guest: 'Guest from France', dates: '1–8 Nov', nights: 7, channel: 'Direct', total: '€980' }].map((r, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 text-sm">
                        <div>
                          <p className="font-medium">{r.guest}</p>
                          <p className="text-xs text-muted-foreground">{r.dates} · {r.nights} nights · {r.channel}</p>
                        </div>
                        <span className="font-semibold text-primary">{r.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInView>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <FadeInView>
                <div className="space-y-4">
                  {[{ name: 'Sarah M.', rating: 5, text: 'Absolutely stunning apartment. Immaculately clean, brilliantly located, and the communication was world-class. Best place I\'ve stayed in Malta.', date: 'Nov 2025' },
                    { name: 'Luca R.', rating: 5, text: 'Perfect in every way. The view from the terrace at sunset is something else. We\'ll be back.', date: 'Nov 2025' },
                    { name: 'James T.', rating: 5, text: 'Seamless check-in, spotless property, and great location. Would absolutely recommend.', date: 'Oct 2025' }].map((r, i) => (
                    <div key={i} className="bg-card border border-border/30 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} className="text-primary fill-primary" />)}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </FadeInView>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <FadeInView>
                <div className="bg-card border border-border/30 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-border/20">
                    <h3 className="font-semibold">Maintenance Log</h3>
                  </div>
                  <div className="divide-y divide-border/20">
                    {[{ task: 'Bathroom re-siliconing', date: 'Nov 2025', cost: '€85', status: 'Completed', type: 'Preventive' },
                      { task: 'AC filter replacement', date: 'Oct 2025', cost: '€45', status: 'Completed', type: 'Routine' },
                      { task: 'Kitchen tap washer', date: 'Sep 2025', cost: '€30', status: 'Completed', type: 'Corrective' }].map((m, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-4 text-sm">
                        <div>
                          <p className="font-medium">{m.task}</p>
                          <p className="text-xs text-muted-foreground">{m.date} · {m.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{m.cost}</p>
                          <span className="text-xs text-green-500">{m.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInView>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
