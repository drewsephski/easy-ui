export interface Template {
  name: string;
  image: string;
  path: string;
  description: string;
  isNew?: boolean;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isFree?: boolean;
}

export const templates: Template[] = [
  { name: 'Introduction', image: 'https://images.unsplash.com/photo-1663465374413-83cba00bff6f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cXVlc3Rpb24lMjBtYXJrfGVufDB8fDB8fHww', path: '/docs/introduction', description: 'Get started with our templates', category: 'General', difficulty: 'Beginner' },
  { name: 'EZ Beautiful', image: '/ez-beautiful.png', path: '/docs/ez-beautiful', description: 'Design stunning interfaces', isNew: true, category: 'Design', difficulty: 'Beginner' },
  { name: 'EZ Glow', image: '/ez-gloww.png', path: '/docs/ez-glow', description: 'Template for startups', isNew: true, category: 'Landing Page', difficulty: 'Beginner' },
  { name: 'EZ Shadcn', image: '/ez-shadcn.png', path: '/docs/ez-nextui', description: 'UI components collection', category: 'UI Components', difficulty: 'Intermediate' },
  { name: 'EZ Dashboard', image: '/ez-dashboard.png', path: '/docs/ez-dashboard', description: 'Admin dashboard template', category: 'Dashboard', difficulty: 'Advanced' },
  { name: 'EZ Portfolio', image: '/ez-portfolio.png', path: '/docs/ez-portfolio-2', description: 'Portfolio website template', category: 'Portfolio', difficulty: 'Beginner' },
  { name: 'EZ Blog', image: '/ez-blog.png', path: '/docs/ez-blog', description: 'Blog template', category: 'Blog', difficulty: 'Beginner' },
  { name: 'EZ SaaS', image: '/ez-saas.png', path: '/docs/ez-SaaS', description: 'SaaS landing page', category: 'SaaS', difficulty: 'Intermediate' },
  { name: 'EZ Design', image: '/ez-design.png', path: '/docs/ez-design', description: 'Design system template', category: 'Design', difficulty: 'Intermediate' },
  { name: 'EZ Docs', image: '/ez-docs.png', path: '/docs/ez-docs', description: 'Documentation template', category: 'Documentation', difficulty: 'Beginner' },
  { name: 'EZ Landing', image: '/ez-landing.png', path: '/docs/ez-landing-docs', description: 'Landing page template', category: 'Landing Page', difficulty: 'Beginner' },
  { name: 'EZ Marketplace', image: '/ez-marketplace.png', path: '/docs/ez-marketplace', description: 'Marketplace template', category: 'E-commerce', difficulty: 'Advanced' },
  { name: 'EZ Newsletter', image: '/ez-newsletter.png', path: '/docs/ez-newsletter', description: 'Newsletter template', category: 'Marketing', difficulty: 'Beginner' },
  { name: 'EZ Notes', image: '/ez-notes.png', path: '/docs/ez-notes', description: 'Notes app template', category: 'Productivity', difficulty: 'Intermediate' },
  { name: 'EZ AI', image: '/ez-ai.png', path: '/docs/ez-ai', description: 'AI application template', category: 'AI', difficulty: 'Advanced' },
  { name: 'EZ Chatbot', image: '/ez-chatbot.png', path: '/docs/ez-chatbot', description: 'Chatbot interface template', category: 'AI', difficulty: 'Intermediate' },
  { name: 'EZ Grids', image: '/ez-grids.png', path: '/docs/ez-grids', description: 'Responsive grid system', category: 'UI Components', difficulty: 'Intermediate' },
  { name: 'EZ Haze', image: '/ez-haze.png', path: '/docs/ez-haze', description: 'Hover effects template', category: 'UI Components', difficulty: 'Beginner' },
  { name: 'EZ Indigo', image: '/ez-indigo.png', path: '/docs/ez-indigo', description: 'Indigo theme template', category: 'Themes', difficulty: 'Beginner' },
  { name: 'EZ Red', image: '/ez-red.png', path: '/docs/ez-red', description: 'Red theme template', category: 'Themes', difficulty: 'Beginner' }
];
