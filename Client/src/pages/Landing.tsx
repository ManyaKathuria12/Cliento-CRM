import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Users,
  Zap,
  Shield,
  Star,
  CheckCircle,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const features = [
  { icon: Users, title: "Smart Lead Management", desc: "Track and nurture leads with AI-powered scoring and insights." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Beautiful dashboards with actionable metrics at a glance." },
  { icon: Zap, title: "AI Assistant", desc: "Get intelligent suggestions and automate repetitive tasks." },
  { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption with role-based access control." },
];

const stats = [
  { value: "10K+", label: "Active Users", icon: Users },
  { value: "₹50Cr+", label: "Revenue Tracked", icon: BarChart3 },
  { value: "99.9%", label: "Uptime", icon: CheckCircle },
  { value: "4.9★", label: "Rating", icon: Star },
];

const Landing = () => (
  <div className="min-h-screen bg-background">
    {/* Navbar */}
    <nav className="fixed top-0 w-full z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md font-medium tracking-wide">Features</a>
          <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md font-medium tracking-wide">Stats</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md font-medium tracking-wide">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Log in
          </Link>
          <Link to="/login" className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-xl hover:opacity-90 transition-opacity font-medium">
            Get Started
          </Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="pt-20 pb-12 px-6 relative overflow-hidden sm:pt-24 sm:pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-[1200px] mx-auto text-center relative z-10 w-full"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary mb-6">
          <Star size={14} /> Trusted by 10,000+ businesses across India
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          <span className="text-foreground">Your CRM,</span>
          <br />
          <span className="text-gradient">Supercharged with AI</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Cliento helps you manage leads, close deals, and grow your business with intelligent automation and beautiful analytics.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity text-base"
          >
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <a href="#features" className="inline-flex items-center gap-2 glass px-8 py-3 rounded-xl font-medium text-foreground hover:bg-secondary transition-colors text-base">
            Learn More
          </a>
        </div>
        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12 relative z-10"
        >
          <div className="dashboard-mockup mx-auto rounded-2xl glass p-6 max-w-[1400px] w-full">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-card/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-foreground">Overview</h4>
                  <div className="text-xs text-muted-foreground">Updated now</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="widget-card glass p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Total Leads</div>
                    <div className="text-lg font-bold text-gradient">3,482</div>
                  </div>
                  <div className="widget-card glass p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Active Deals</div>
                    <div className="text-lg font-bold text-gradient">128</div>
                  </div>
                  <div className="widget-card glass p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Revenue</div>
                    <div className="text-lg font-bold text-gradient">₹12.4L</div>
                  </div>
                  <div className="widget-card glass p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Conversion</div>
                    <div className="text-lg font-bold text-gradient">6.8%</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 bg-card/30 rounded-lg p-4 flex flex-col gap-3">
                <div className="text-sm font-semibold text-foreground">Quick Actions</div>
                <button className="glass px-3 py-2 rounded-md text-sm text-foreground">Create Lead</button>
                <button className="glass px-3 py-2 rounded-md text-sm text-foreground">New Deal</button>
                <div className="mt-auto text-xs text-muted-foreground">Integrations connected</div>
              </div>
            </div>
          </div>

          {/* Floating glass cards */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="floating-card glass left-[10%] top-[-24px]"
            >
              <div className="text-xs text-muted-foreground">Leads Today</div>
              <div className="text-lg font-bold text-gradient">128</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="floating-card glass right-[8%] top-[40px]"
            >
              <div className="text-xs text-muted-foreground">Win Rate</div>
              <div className="text-lg font-bold text-gradient">31%</div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>

    {/* Stats */}
    <section id="stats" className="py-14 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-4 lg:px-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="stat-card glass rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center mb-3">
              <s.icon size={20} className="text-primary mr-2" />
            </div>
            <div className="text-3xl font-bold text-gradient">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section id="features" className="py-16 px-6">
      <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need to close more deals</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Powerful features designed for modern sales teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 hover-lift gradient-border feature-hover min-h-[220px] flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section id="testimonials" className="py-16 px-6">
      <div className="max-w-[1400px] mx-auto w-full px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Loved by teams across India</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Priya Sharma", role: "Sales Head, TechCorp", text: "Cliento transformed how we manage our pipeline. Revenue up 40% in 3 months." },
            { name: "Rahul Patel", role: "CEO, GrowthHQ", text: "The AI assistant is a game-changer. It's like having an extra team member." },
            { name: "Anita Desai", role: "VP Sales, InnovateLabs", text: "Best CRM we've used. The interface is beautiful and incredibly intuitive." },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 testimonial-card h-full flex flex-col justify-between min-h-[260px]"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-primary fill-primary" />)}
              </div>
                <p className="text-base text-foreground leading-7">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-6">
      <div className="max-w-[1200px] mx-auto text-center glass rounded-3xl p-16 gradient-border cta-glow transition-all w-full px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-foreground">Ready to grow your business?</h2>
        <p className="mt-4 text-muted-foreground">Join thousands of teams using Cliento to close more deals.</p>
        <Link
          to="/login"
          className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-10 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-lg"
        >
          Get Started Free <ArrowRight size={18} />
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border/50 py-8 px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 w-full px-4 lg:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>+91 98765 43210</span>
          <span>hello@cliento.in</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/10 transition-colors text-muted-foreground social-icon">
              <Twitter size={16} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/10 transition-colors text-muted-foreground social-icon">
              <Github size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/10 transition-colors text-muted-foreground social-icon">
              <Linkedin size={16} />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Cliento. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
