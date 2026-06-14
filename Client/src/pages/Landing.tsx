import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  Users,
  Zap,
  Shield,
  Star,
  CheckCircle,
  Clock,
  CreditCard,
  Zap as ZapIcon,
  X,
  ExternalLink,
  Lock,
} from "lucide-react";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import useDashboardStats from "@/hooks/useDashboardStats";
import useLiveActivity from "@/hooks/useLiveActivity";
import toast from "react-hot-toast";

const featuresData = [
  { 
    icon: Users, 
    title: "Smart Lead Management", 
    desc: "Track and nurture leads with AI-powered scoring and insights.",
    benefits: ["AI Lead Scoring", "Lead Nurturing Automation", "Lead Source Tracking", "Lead Status Pipeline"],
    route: "/login"
  },
  { 
    icon: BarChart3, 
    title: "Real-time Analytics", 
    desc: "Beautiful dashboards with actionable metrics at a glance.",
    benefits: ["Interactive Dashboards", "Real-time Reports", "Custom Metrics", "Data Export"],
    route: "/login"
  },
  { 
    icon: Zap, 
    title: "AI Assistant", 
    desc: "Get intelligent suggestions and automate repetitive tasks.",
    benefits: ["Smart Recommendations", "Task Automation", "Email Templates", "Follow-up Scheduling"],
    route: "/login"
  },
  { 
    icon: Shield, 
    title: "Enterprise Security", 
    desc: "Bank-grade encryption with role-based access control.",
    benefits: ["256-bit Encryption", "Role-based Access", "Audit Logs", "2FA Support"],
    route: "/login"
  },
  { 
    icon: Star, 
    title: "Custom Workflows", 
    desc: "Build workflows that match your unique business processes.",
    benefits: ["Drag-drop Builder", "Process Templates", "Workflow Analytics", "Team Automation"],
    route: "/login"
  },
  { 
    icon: CheckCircle, 
    title: "Team Collaboration", 
    desc: "Keep your entire team aligned with shared insights.",
    benefits: ["Real-time Sync", "Team Chat", "Shared Pipelines", "Activity Feed"],
    route: "/login"
  },
];

// Smooth scroll behavior
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const { data, loading } = useDashboardStats(5000);
  const [activeSection, setActiveSection] = useState<string>("");
  const [selectedFeature, setSelectedFeature] = useState<typeof featuresData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    leads,
    deals: recentDeals,
    tasks: recentTasks,
    contacts: recentContacts,
    loading: activityLoading,
    timeAgo,
    tasksDueToday,
    contactsThisMonth,
    refetch: refetchActivity,
  } = useLiveActivity(30000);

  // Active nav highlighting on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      scrollTimeoutRef.current = setTimeout(() => {
        const sections = ['features', 'overview', 'activity'];
        
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top < 200 && rect.bottom > 200) {
              setActiveSection(section);
              break;
            }
          }
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Handle feature card click
  const handleFeatureClick = (feature: typeof featuresData[0]) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  // Handle feature "Learn More" from modal — redirect to login
  const handleFeatureNavigation = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  // Protected CRM content — show login modal
  const handleProtectedContentClick = () => {
    setShowLoginRequiredModal(true);
  };

  // Handle login redirect from modal
  const handleLoginRedirect = () => {
    setShowLoginRequiredModal(false);
    navigate("/login");
  };

  // Handle refresh activity
  const handleRefreshActivity = async () => {
    try {
      await refetchActivity();
      toast.success("Activity data refreshed!");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  // Handle footer navigation
  const handleFooterLink = (link: string) => {
    try {
      switch(link) {
        case 'privacy':
          navigate('/privacy');
          break;
        case 'terms':
          navigate('/terms');
          break;
        case 'contact':
          navigate('/contact');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Navigation failed");
    }
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => scrollToSection('features')}
              onKeyDown={(e) => e.key === 'Enter' && scrollToSection('features')}
              className={`text-sm transition-all px-4 py-2 rounded-lg font-medium ${activeSection === 'features' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Navigate to Features section"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('overview')}
              onKeyDown={(e) => e.key === 'Enter' && scrollToSection('overview')}
              className={`text-sm transition-all px-4 py-2 rounded-lg font-medium ${activeSection === 'overview' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Navigate to Overview section"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToSection('activity')}
              onKeyDown={(e) => e.key === 'Enter' && scrollToSection('activity')}
              className={`text-sm transition-all px-4 py-2 rounded-lg font-medium ${activeSection === 'activity' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Navigate to Activity section"
            >
              Activity
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-all text-sm"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden sm:pt-40 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-[1200px] mx-auto text-center relative z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary mb-6 hover:bg-primary/10 transition-colors">
            <Star size={14} /> Trusted by businesses across India
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            <span className="text-foreground">Your CRM,</span>
            <br />
            <span className="text-gradient">Supercharged with AI</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cliento helps you manage leads, close deals, and grow your business with intelligent automation and beautiful analytics.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all hover:shadow-lg text-base cursor-pointer"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 glass px-8 py-3 rounded-xl font-medium text-foreground hover:bg-secondary transition-all hover:shadow-md text-base cursor-pointer"
            >
              Login
            </Link>
            <button 
              onClick={() => scrollToSection('features')}
              onKeyDown={(e) => e.key === 'Enter' && scrollToSection('features')}
              className="inline-flex items-center gap-2 glass px-8 py-3 rounded-xl font-medium text-foreground hover:bg-secondary transition-all hover:shadow-md text-base cursor-pointer"
              aria-label="Learn more about features"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Live CRM Overview - Premium Dashboard Card */}
      <section id="overview" className="py-20 px-6 relative scroll-mt-20">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="premium-dashboard glass rounded-3xl p-8 md:p-10 border border-primary/20 shadow-2xl relative overflow-hidden"
          >
            {/* Gradient background effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Live CRM Overview</h3>
                <p className="text-sm text-muted-foreground mt-2">Aggregate metrics — sign in for full access</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-lg">
                <Lock size={14} className="text-primary shrink-0" />
                <span className="hidden sm:inline">Login required to access full CRM data.</span>
              </div>
            </div>
            
            {/* 3x2 Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Leads */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view leads"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Leads</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Users size={24} className="text-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : data?.totalLeads ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-3">+12 this month</div>
                </div>
              </motion.button>

              {/* Active Deals */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view deals"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Deals</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <BarChart3 size={24} className="text-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : data?.activeDeals ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-3">{data?.wonDeals ?? 0} won this period</div>
                </div>
              </motion.button>

              {/* Revenue */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view revenue analytics"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                    <CheckCircle size={24} className="text-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : `₹${data?.revenue ?? 0}`}</div>
                  <div className="text-sm text-muted-foreground mt-3">+₹45000 this month</div>
                </div>
              </motion.button>

              {/* Conversion Rate */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view conversion analytics"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Conversion Rate</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 flex items-center justify-center transition-colors">
                    <Star size={24} className="text-yellow-500" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : `${data?.conversionRate ?? 0}%`}</div>
                  <div className="text-sm text-muted-foreground mt-3">{data?.wonDeals ?? 0} deals converted</div>
                </div>
              </motion.button>

              {/* Tasks Due Today */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view tasks"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tasks Due Today</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <Clock size={24} className="text-red-500" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : tasksDueToday ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-3">{data?.pendingTasks ?? 0} tasks pending</div>
                </div>
              </motion.button>

              {/* Contacts This Month */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleProtectedContentClick}
                onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                className="stat-card glass rounded-2xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[180px] flex flex-col justify-between group cursor-pointer text-left"
                aria-label="Login required to view contacts"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">New Contacts</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                    <Users size={24} className="text-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">{loading ? '—' : contactsThisMonth ?? 0}</div>
                  <div className="text-sm text-muted-foreground mt-3">Added this month</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Everything you need to close more deals</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Powerful features designed for modern sales teams to accelerate growth.</p>
          </motion.div>
          
          {/* Balanced 2x3 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((f, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleFeatureClick(f)}
                onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick(f)}
                className="group relative glass rounded-2xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-300 min-h-[280px] flex flex-col text-left cursor-pointer"
                aria-label={`Learn more about ${f.title}`}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 rounded-2xl transition-all duration-300" />
                
                <div className="relative z-10 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-6 transition-all duration-300 group-hover:shadow-lg">
                    <f.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{f.desc}</p>
                </div>
                
                {/* Bottom accent */}
                <div className="relative z-10 mt-6 pt-4 border-t border-primary/10 group-hover:border-primary/20 transition-colors">
                  <span className="text-sm text-primary font-medium flex items-center gap-1">Learn more <ExternalLink size={14} /></span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Live CRM Activity - 2x2 Layout */}
      <section id="activity" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Live CRM Activity</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Preview of recent CRM activity — read-only showcase for visitors.</p>
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-muted/30 text-sm text-muted-foreground">
              <Lock size={14} className="text-primary shrink-0" />
              Login required to access full CRM data.
            </div>
          </motion.div>
          
          {/* 2x2 Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="activity-card glass rounded-2xl p-8 border border-primary/10 hover:border-primary/20 transition-all min-h-[420px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Recent Leads</h3>
                  <p className="text-sm text-muted-foreground mt-1">Latest lead activity</p>
                </div>
                <button 
                  onClick={handleRefreshActivity}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefreshActivity()}
                  className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Refresh activity data"
                >
                  Refresh
                </button>
              </div>
              <div id="recent-leads" className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {activityLoading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
                {!activityLoading && (!leads || leads.length === 0) && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">No recent leads yet</div>
                )}
                {!activityLoading && leads && leads.map((l) => (
                  <motion.button
                    key={l.id}
                    whileHover={{ x: 4 }}
                    onClick={handleProtectedContentClick}
                    onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                    className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-left group relative"
                    aria-label="Login required to view lead details"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          {l.label}
                          <Lock size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{timeAgo(l.createdAt, l.id)}</div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ml-2 ${l.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400' : l.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' : 'bg-muted/40 text-muted-foreground'}`}>
                        {l.status || 'new'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Deals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="activity-card glass rounded-2xl p-8 border border-primary/10 hover:border-primary/20 transition-all min-h-[420px] flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Deals</h3>
                <p className="text-sm text-muted-foreground mt-1">Pipeline activity and stage updates</p>
              </div>
              <div id="recent-deals" className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {activityLoading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
                {!activityLoading && (!recentDeals || recentDeals.length === 0) && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">No recent deals</div>
                )}
                {!activityLoading && recentDeals && recentDeals.map((d) => (
                  <motion.button
                    key={d.id}
                    whileHover={{ x: 4 }}
                    onClick={handleProtectedContentClick}
                    onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                    className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-left group relative"
                    aria-label="Login required to view deal details"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          {d.label}
                          <Lock size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{timeAgo(d.createdAt, d.id)}</div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ml-2 ${d.stage === 'won' ? 'bg-emerald-500/20 text-emerald-400' : d.stage === 'lost' ? 'bg-red-500/20 text-red-400' : d.stage === 'negotiation' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {d.stage || 'new'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Tasks */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="activity-card glass rounded-2xl p-8 border border-primary/10 hover:border-primary/20 transition-all min-h-[420px] flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">Upcoming and completed actions</p>
              </div>
              <div id="recent-tasks" className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {activityLoading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
                {!activityLoading && (!recentTasks || recentTasks.length === 0) && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">No recent tasks</div>
                )}
                {!activityLoading && recentTasks && recentTasks.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ x: 4 }}
                    onClick={handleProtectedContentClick}
                    onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                    className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-left group relative"
                    aria-label="Login required to view task details"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          {t.label}
                          <Lock size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{t.due ? timeAgo(t.due) : timeAgo(t.createdAt, t.id)}</div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ml-2 ${t.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' : t.status === 'progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-muted/40 text-muted-foreground'}`}>
                        {t.status || 'todo'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Contacts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="activity-card glass rounded-2xl p-8 border border-primary/10 hover:border-primary/20 transition-all min-h-[420px] flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Recent Contacts</h3>
                <p className="text-sm text-muted-foreground mt-1">New and updated contacts</p>
              </div>
              <div id="recent-contacts" className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {activityLoading && Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
                {!activityLoading && (!recentContacts || recentContacts.length === 0) && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">No recent contacts</div>
                )}
                {!activityLoading && recentContacts && recentContacts.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ x: 4 }}
                    onClick={handleProtectedContentClick}
                    onKeyDown={(e) => e.key === 'Enter' && handleProtectedContentClick()}
                    className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-left group relative"
                    aria-label="Login required to view contact details"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          {c.label}
                          <Lock size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{timeAgo(c.createdAt, c.id)}</div>
                      </div>
                      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-muted/40 text-muted-foreground ml-2">
                        {c.role || 'contact'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <selectedFeature.icon size={32} className="text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">{selectedFeature.title}</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-lg text-muted-foreground mb-6">{selectedFeature.desc}</p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {selectedFeature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle size={20} className="text-primary flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleFeatureNavigation}
                onKeyDown={(e) => e.key === 'Enter' && handleFeatureNavigation()}
                className="w-full bg-gradient-to-r from-primary to-cyan text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Login to Explore {selectedFeature.title}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginRequiredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginRequiredModal(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl p-8 max-w-md w-full border border-primary/20 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock size={28} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Please login to access CRM records.</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Sign in to view leads, deals, tasks, contacts, and full CRM details.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={handleLoginRedirect}
                    className="flex-1 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    Login
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setShowLoginRequiredModal(false)}
                    className="flex-1 inline-flex items-center justify-center glass px-6 py-3 rounded-xl font-medium text-foreground hover:bg-secondary transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>
                <button
                  onClick={() => setShowLoginRequiredModal(false)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[1100px] mx-auto relative z-10"
        >
          <div className="premium-dashboard glass rounded-3xl p-12 md:p-16 border border-primary/30 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">Ready to grow your business?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Join thousands of sales teams using Cliento to close more deals faster.</p>
              
              {/* Trial benefits */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <CreditCard size={20} className="text-primary flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">No Credit Card</div>
                    <div className="text-xs text-muted-foreground">Required</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <Clock size={20} className="text-primary flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">14-Day Trial</div>
                    <div className="text-xs text-muted-foreground">Free access</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <ZapIcon size={20} className="text-primary flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground">Setup in 2 Min</div>
                    <div className="text-xs text-muted-foreground">Quick start</div>
                  </div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6"
              >
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-all hover:shadow-2xl text-lg cursor-pointer"
                >
                  Start Free Trial <ArrowRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 glass px-10 py-4 rounded-xl font-medium text-foreground hover:bg-secondary transition-all text-lg cursor-pointer"
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Logo size="sm" />
              <p className="mt-3 text-sm text-muted-foreground">Intelligent CRM for modern sales teams.</p>
            </div>
            <div className="flex items-start justify-center gap-8 text-sm">
              <button 
                onClick={() => handleFooterLink('privacy')}
                onKeyDown={(e) => e.key === 'Enter' && handleFooterLink('privacy')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleFooterLink('terms')}
                onKeyDown={(e) => e.key === 'Enter' && handleFooterLink('terms')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleFooterLink('contact')}
                onKeyDown={(e) => e.key === 'Enter' && handleFooterLink('contact')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>
            <div className="flex items-start justify-end gap-4 text-sm">
              <div className="text-right">
                <a 
                  href="tel:+919876543210"
                  className="text-muted-foreground hover:text-foreground transition-colors block cursor-pointer"
                  aria-label="Call phone number"
                >
                  +91 98765 43210
                </a>
                <a 
                  href="mailto:hello@cliento.in"
                  className="text-muted-foreground hover:text-foreground transition-colors block cursor-pointer"
                  aria-label="Send email"
                >
                  hello@cliento.in
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2026 Cliento. All rights reserved.</p>
            <p className="text-xs text-muted-foreground mt-4 md:mt-0">Made with ❤️ for sales teams</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
