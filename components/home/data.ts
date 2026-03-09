// ─── Shared data & types ──────────────────────────────────────────────────────

export interface Service {
  title: string;
  description: string;
  icon: string;
  tags: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  result: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initial: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export const services: Service[] = [
  {
    title: 'Web Design & Development',
    description: 'From pixel-perfect landing pages to complex web applications — we craft responsive, conversion-optimised digital experiences that represent your brand with precision.',
    icon: '⬡',
    tags: ['React / Next.js', 'UI/UX Design', 'SEO-Ready'],
  },
  {
    title: 'Cloud Hosting & Infrastructure',
    description: 'Enterprise-grade hosting with 99.9% uptime SLAs. We manage your servers, databases, and CI/CD pipelines so you can focus entirely on your product.',
    icon: '◈',
    tags: ['AWS / GCP', 'Docker & K8s', 'Auto-scaling'],
  },
  {
    title: 'Workflow Automation',
    description: 'Eliminate repetitive manual tasks with intelligent automation. We integrate your tools, build custom bots, and engineer end-to-end pipelines that save hundreds of hours a year.',
    icon: '⟁',
    tags: ['n8n / Zapier', 'Custom Scripts', 'API Integrations'],
  },
  {
    title: 'Mobile Applications',
    description: 'Native-quality iOS and Android apps built with cross-platform efficiency. Stunning interfaces backed by robust, scalable architectures — shipped on time.',
    icon: '⬟',
    tags: ['React Native', 'Flutter', 'App Store Launch'],
  },
];

export const stats: Stat[] = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '3×', label: 'Average ROI Reported' },
  { value: '< 48 h', label: 'Average Response Time' },
];

export const featuredProjects: Project[] = [
  {
    title: 'FleetDrive — Car Rental Platform',
    description: 'Full fleet management SaaS with real-time vehicle tracking, dynamic pricing engine, and an automated customer booking portal. Reduced admin overhead by 60%.',
    tech: ['Next.js', 'Supabase', 'Stripe', 'MapBox'],
    result: '↑ 60% admin efficiency',
  },
  {
    title: 'GreenRoot — Hydroponic Farms',
    description: 'IoT-connected automation system for urban vertical farms. Sensor dashboards, automated nutrient dosing, and predictive harvest scheduling.',
    tech: ['React', 'MQTT', 'Node.js', 'InfluxDB'],
    result: '↑ 35% crop yield',
  },
  {
    title: 'Serenity — Spa Booking System',
    description: 'White-label booking and CRM platform for wellness businesses. Integrated payments, staff scheduling, loyalty rewards, and automated client reminders.',
    tech: ['Next.js', 'Prisma', 'Twilio', 'Stripe'],
    result: '↑ 45% bookings online',
  },
  {
    title: 'QuickBite — Food Ordering App',
    description: 'Cross-platform mobile ordering app for a multi-location restaurant chain. Real-time order tracking, loyalty tiers, and a kitchen display system.',
    tech: ['React Native', 'Firebase', 'Expo', 'Square'],
    result: '↑ 80% repeat orders',
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: 'Karuna delivered a platform that transformed how we manage our rental fleet. The quality and speed of delivery were outstanding — we hit our launch date and went live without a hitch.',
    author: 'Sarah Thompson',
    role: 'CEO, FleetDrive Inc.',
    initial: 'S',
  },
  {
    quote: 'Their automation solution cut our manual data entry from 4 hours a day to near-zero. The ROI in the first month alone exceeded our entire project investment.',
    author: 'Marcus Osei',
    role: 'Operations Director, GreenRoot Farms',
    initial: 'M',
  },
  {
    quote: 'Professional, communicative, and technically excellent. Karuna felt like an extension of our own team rather than an outside vendor.',
    author: 'Priya Nair',
    role: 'Founder, Serenity Wellness',
    initial: 'P',
  },
];

export const processSteps: ProcessStep[] = [
  { step: '01', title: 'Discovery', description: 'We audit your goals, constraints, and competitive landscape to align on what truly matters.' },
  { step: '02', title: 'Architecture', description: 'We design a technical blueprint — scalable, maintainable, and chosen for your exact context.' },
  { step: '03', title: 'Build & Iterate', description: 'Agile sprints with weekly demos keep you in control. No black-box development.' },
  { step: '04', title: 'Launch & Support', description: 'We handle deployment, monitoring, and provide ongoing support so nothing slips post-launch.' },
];
