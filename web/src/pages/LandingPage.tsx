import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Workflow,
  ArrowRight,
  Shield,
  BarChart3,
  Check,
  ChevronRight,
  Menu,
  X,
  Zap,
  Download,
  Eye,
  HeartPulse,
  Blocks,
  Unlock,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Docs', href: '/docs' },
];

const features = [
  {
    icon: Eye,
    title: 'Visual Drag-and-Drop Builder',
    description:
      'Design complex automations on an intuitive canvas. Connect nodes, configure steps, and see your workflow come to life in minutes.',
    color: 'text-primary-500 bg-primary-50',
  },
  {
    icon: BarChart3,
    title: 'Pay Per Execution, Not Per Step',
    description:
      'A 30-step workflow counts as a single execution. Your bill reflects value delivered, not data-transfer overhead.',
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    icon: HeartPulse,
    title: 'Built-in Health Monitoring',
    description:
      'Get alerts the moment a workflow fails, not three days later when customers start complaining.',
    color: 'text-amber-500 bg-amber-50',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description:
      'Export any workflow as YAML or JSON. Your automations belong to you, not to us. Zero vendor lock-in.',
    color: 'text-violet-500 bg-violet-50',
  },
  {
    icon: Blocks,
    title: '15+ Core Integrations',
    description:
      'Gmail, Slack, Shopify, Stripe, HubSpot, Notion, Airtable, and more. Plus a universal HTTP node for everything else.',
    color: 'text-sky-500 bg-sky-50',
  },
  {
    icon: Unlock,
    title: 'No Vendor Lock-In',
    description:
      'Migrate freely with open-format exports. Run on our cloud or bring your own infrastructure when you are ready.',
    color: 'text-rose-500 bg-rose-50',
  },
];

const comparisonData = [
  { feature: 'Pricing model', autoflow: 'Per execution', zapier: 'Per task step', make: 'Per operation', n8n: 'Per execution / Free (self-host)' },
  { feature: 'Entry-level', autoflow: 'Free (1,000 exec/mo)', zapier: '$19.95/mo (750 tasks)', make: '$9/mo (1,000 ops)', n8n: 'Free (self-host) / $22/mo cloud' },
  { feature: 'Mid-tier', autoflow: '$19/mo (10K executions)', zapier: '$69/mo (5,000 tasks)', make: '$29/mo (10K ops)', n8n: '$65/mo (10K executions)' },
  { feature: 'Max for $300/mo', autoflow: '1,000,000 executions', zapier: '~50,000 tasks', make: '~200,000 ops', n8n: '~100,000+ executions' },
  { feature: 'Visual builder', autoflow: 'Check', zapier: 'Check', make: 'Check', n8n: 'Check' },
  { feature: 'Code nodes (JS/Python)', autoflow: 'Check', zapier: 'Limited', make: 'Limited', n8n: 'Check' },
  { feature: 'Self-hosting', autoflow: 'Coming Q2 2026', zapier: 'Cross', make: 'Cross', n8n: 'Check' },
  { feature: 'Workflow export', autoflow: 'Check', zapier: 'Cross', make: 'Limited', n8n: 'Check' },
  { feature: 'Health alerts', autoflow: 'Check', zapier: 'Cross', make: 'Cross', n8n: 'Cross' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* -- Navigation -- */}
      <header className="fixed inset-x-0 top-0 z-50 glass">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="8" cy="16" r="3" fill="white" />
                <circle cx="24" cy="8" r="3" fill="white" />
                <circle cx="24" cy="24" r="3" fill="white" />
                <path d="M11 16h4l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 16h4l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900">AutoFlow</span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-surface-600 transition-colors hover:text-surface-900"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/app/dashboard">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-surface-200 bg-white px-6 py-4 md:hidden">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 text-sm font-medium text-surface-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Link to="/app/dashboard" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* -- Hero -- */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 to-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left column */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-200 bg-white px-4 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-surface-600">
                  Now in public beta
                </span>
              </div>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-surface-900 lg:text-6xl text-balance">
                Build Automations That{' '}
                <span className="text-primary-600">Scale With You,</span>{' '}
                Not Against You.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-surface-600">
                Per-execution pricing means a 30-step workflow costs the same as a 3-step one.
                Your bill reflects value delivered, not data-transfer overhead.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg">
                    Start Free
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg">
                    See How It Works
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-surface-400">
                Free plan includes 1,000 executions per month. No credit card required.
              </p>
            </div>

            {/* Right column - Abstract workflow illustration */}
            <div className="hidden lg:block">
              <div className="relative mx-auto h-[440px] w-[440px]">
                {/* Animated connected nodes illustration */}
                <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                    <radialGradient id="bgGrad1" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#eef2ff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#eef2ff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="bgGrad2" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Background glow */}
                  <circle cx="200" cy="180" r="160" fill="url(#bgGrad1)" className="animate-pulse" />
                  <circle cx="320" cy="100" r="80" fill="url(#bgGrad2)" className="animate-pulse" style={{ animationDelay: '1s' }} />

                  {/* Connection lines */}
                  <g stroke="url(#lineGrad)" strokeWidth="2.5" fill="none" opacity="0.6">
                    <path d="M70,280 C130,280 130,200 200,180" className="animate-draw" />
                    <path d="M200,180 C270,160 270,100 320,80" className="animate-draw" style={{ animationDelay: '0.2s' }} />
                    <path d="M200,180 C270,200 280,280 330,300" className="animate-draw" style={{ animationDelay: '0.4s' }} />
                    <path d="M200,180 C130,160 100,100 120,40" className="animate-draw" style={{ animationDelay: '0.6s' }} />
                    <path d="M320,80 L380,60" className="animate-draw" style={{ animationDelay: '0.3s' }} />
                    <path d="M330,300 L380,340" className="animate-draw" style={{ animationDelay: '0.5s' }} />
                  </g>

                  {/* Nodes */}
                  {[
                    { cx: 70, cy: 280, r: 24, delay: 0 },
                    { cx: 200, cy: 180, r: 36, delay: 0.2 },
                    { cx: 320, cy: 80, r: 28, delay: 0.3 },
                    { cx: 330, cy: 300, r: 28, delay: 0.4 },
                    { cx: 120, cy: 40, r: 20, delay: 0.5 },
                    { cx: 380, cy: 60, r: 18, delay: 0.6 },
                    { cx: 380, cy: 340, r: 18, delay: 0.7 },
                  ].map((node, i) => (
                    <g key={i} className="animate-float" style={{ animationDelay: `${node.delay}s` }}>
                      <circle cx={node.cx} cy={node.cy} r={node.r} fill="white" stroke="#6366f1" strokeWidth="3" />
                      <circle cx={node.cx} cy={node.cy} r={node.r * 0.35} fill="#6366f1" />
                    </g>
                  ))}

                  {/* Data flow particles */}
                  <circle r="4" fill="#818cf8" opacity="0.8" className="animate-flow">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M70,280 C130,280 130,200 200,180" />
                  </circle>
                  <circle r="3" fill="#a5b4fc" opacity="0.8" className="animate-flow">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M200,180 C270,160 270,100 320,80" begin="0.5s" />
                  </circle>
                  <circle r="3" fill="#a5b4fc" opacity="0.8" className="animate-flow">
                    <animateMotion dur="3.5s" repeatCount="indefinite" path="M200,180 C270,200 280,280 330,300" begin="1s" />
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Features -- */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Why AutoFlow
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-surface-900">
              Built for builders, priced for growth
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-500">
              Every feature designed to save you money, time, and frustration compared to legacy automation platforms.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-surface-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-surface-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Pricing Comparison -- */}
      <section id="pricing" className="bg-surface-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Transparent Pricing
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-surface-900">
              Transparent pricing, always
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-surface-500">
              Compare AutoFlow against the alternatives at the same price points. The difference compounds at scale.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-surface-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-6 py-4 font-semibold text-surface-900">Feature</th>
                  <th className="px-6 py-4 font-semibold text-surface-900 bg-primary-50/50">
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
                        <circle cx="8" cy="16" r="3" fill="#6366f1" />
                        <circle cx="24" cy="8" r="3" fill="#6366f1" />
                        <circle cx="24" cy="24" r="3" fill="#6366f1" />
                        <path d="M11 16h4l4-4" stroke="#6366f1" strokeWidth="2" />
                        <path d="M11 16h4l4 4" stroke="#6366f1" strokeWidth="2" />
                      </svg>
                      AutoFlow
                    </span>
                  </th>
                  <th className="px-6 py-4 font-semibold text-surface-600">Zapier</th>
                  <th className="px-6 py-4 font-semibold text-surface-600">Make</th>
                  <th className="px-6 py-4 font-semibold text-surface-600">n8n</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-50/50">
                    <td className="px-6 py-3 font-medium text-surface-700">{row.feature}</td>
                    <td className="px-6 py-3 bg-primary-50/20">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {row.autoflow === 'Check' ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : null}
                        {row.autoflow}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {row.zapier === 'Check' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : row.zapier === 'Cross' ? (
                        <X className="h-4 w-4 text-surface-300" />
                      ) : (
                        <span className="text-surface-500">{row.zapier}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {row.make === 'Check' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : row.make === 'Cross' ? (
                        <X className="h-4 w-4 text-surface-300" />
                      ) : (
                        <span className="text-surface-500">{row.make}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {row.n8n === 'Check' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : row.n8n === 'Cross' ? (
                        <X className="h-4 w-4 text-surface-300" />
                      ) : (
                        <span className="text-surface-500">{row.n8n}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing cards */}
          <div className="mt-12 grid gap-8 lg:grid-cols-4">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/month',
                exec: '1,000',
                users: '1 user',
                desc: 'For tinkering and personal projects',
                cta: 'Start Free',
                highlight: false,
              },
              {
                name: 'Maker',
                price: '$19',
                period: '/month',
                exec: '10,000',
                users: '1 user',
                desc: 'For indie hackers and solo founders',
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Team',
                price: '$79',
                period: '/month',
                exec: '100,000',
                users: '5 users',
                desc: 'For growing startups and small teams',
                cta: 'Start Free Trial',
                highlight: false,
              },
              {
                name: 'Business',
                price: '$299',
                period: '/month',
                exec: '1,000,000',
                users: '20 users',
                desc: 'For companies that need scale and SLA',
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'rounded-2xl border p-6 transition-shadow hover:shadow-lg',
                  plan.highlight
                    ? 'border-primary-400 bg-primary-50/30 ring-1 ring-primary-400'
                    : 'border-surface-200 bg-white'
                )}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary-600 px-3 py-0.5 text-xs font-medium text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-surface-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-surface-900">{plan.price}</span>
                  <span className="text-sm text-surface-400">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-surface-500">
                  {plan.exec} executions/mo
                </p>
                <p className="text-sm text-surface-500">{plan.users}</p>
                <p className="mt-2 text-sm text-surface-500">{plan.desc}</p>
                <Button
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  className="mt-5 w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing disclaimer */}
      <p className="mt-8 text-center text-xs text-surface-400">
        * Comparison data as of July 2026. Visit each vendor's website for current pricing.
      </p>

      {/* -- Social proof -- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-surface-400">
            Trusted by teams who switched
          </p>
          <p className="mt-2 text-2xl font-bold text-surface-900">
            Join 500+ teams who left legacy automation behind
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-12 opacity-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-12 w-32 items-center justify-center rounded-lg border border-surface-200 bg-surface-50"
              >
                <span className="text-sm font-medium text-surface-400">
                  LOGO {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-3xl bg-surface-900 px-8 py-16 shadow-xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to build?{' '}
              <span className="text-primary-300">Start free.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-surface-400">
              No credit card required. Export your work anytime. Your automations belong to you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg">
                  Start Free
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="ghost" size="lg" className="text-white hover:bg-surface-800">
                  Compare Plans
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="border-t border-surface-200 bg-surface-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
                <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
                  <circle cx="8" cy="16" r="3" fill="white" />
                  <circle cx="24" cy="8" r="3" fill="white" />
                  <circle cx="24" cy="24" r="3" fill="white" />
                  <path d="M11 16h4l4-4" stroke="white" strokeWidth="2" />
                  <path d="M11 16h4l4 4" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-semibold text-surface-900">AutoFlow</span>
            </div>

            <div className="flex gap-8 text-sm text-surface-500">
              <a href="/docs" className="transition-colors hover:text-surface-700">Documentation</a>
              <a href="/blog" className="transition-colors hover:text-surface-700">Blog</a>
              <a href="/privacy" className="transition-colors hover:text-surface-700">Privacy</a>
              <a href="/terms" className="transition-colors hover:text-surface-700">Terms</a>
            </div>

            <p className="text-sm text-surface-400">
              &copy; {new Date().getFullYear()} AutoFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
