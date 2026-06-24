export type MarketingHubLink = {
  label: string;
  href: string;
};

export type MarketingHubGroup = {
  title: string;
  links: MarketingHubLink[];
};

export const WHY_COMPLAI_PAGE_HUB: MarketingHubGroup[] = [
  {
    title: 'On this page',
    links: [
      { label: 'Key outcomes', href: '#outcomes' },
      { label: 'What makes us different', href: '#differentiators' },
      { label: 'Manual vs ComplAI', href: '#comparison' },
      { label: 'By stage', href: '#stages' },
    ],
  },
  {
    title: 'Explore further',
    links: [
      { label: 'Platform', href: '/platform' },
      { label: 'Solutions', href: '/solutions' },
      { label: 'Resources', href: '/resources' },
    ],
  },
];

export const COMPANY_PAGE_HUB: MarketingHubGroup[] = [
  {
    title: 'On this page',
    links: [
      { label: 'About & mission', href: '#about' },
      { label: 'Contact us', href: '#contact' },
    ],
  },
  {
    title: 'Explore further',
    links: [
      { label: 'Why ComplAI', href: '/why-complai' },
      { label: 'Platform', href: '/platform' },
      { label: 'Book a demo', href: '/company?contact=1' },
    ],
  },
];
