export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Easy UI",
  description:
    "Beautifully designed website templates built with React and Tailwind CSS.",
  mainNav: [
    {
      title: "Components",
      href: "/component",
    },
    {
      title: "Pricing",
      href: "/easy-mvp-pricing",
    },
    {
      title: "Templates",
      href: "/template-library",
    },
    {
      title: "Premium",
      href: "/premium",
    },
    {
      title: "Contact",
      href: "/contact",
    }
  ],
  links: {
    twitter: "https://twitter.com/drewsephski",
    github: "https://github.com/drewsephski",
    instagram: "https://instagram.com/drewsephski",
    pricing: "/pricing",
    premium: "/premium",
    templates: "/template-library",
    contact: "/contact"
  },
}
