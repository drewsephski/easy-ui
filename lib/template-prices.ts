// Canonical price mapping for all templates (prices in cents)
export const templatePrices: Record<string, number> = {
  'Introduction': 2999,
  'EZ Beautiful': 19900,
  'EZ Glow': 7900,
  'EZ Premium': 19900,
  'EZ Indigo': 7900,
  'EZ Design': 9900,
  'EZ Newsletter': 2999,
  'EZ Tmp': 9900,
  'EZ Tmp2': 9900,
  'EZ Tmp3': 9900,
  'EZ Tmp4': 9900,
  'EZ Tmp5': 9900,
  'EZ NextUI': 19900,
  'EZ Notes': 9900,
  'EZ Red': 7900,
  'EZ Shots': 7900,
  'EZ Story': 9900,
  'EZ Dashboard': 19900,
  'EZ Docs': 7900,
  'EZ Grids': 2999,
  'EZ Landing Docs': 7900,
  'EZ Marketplace': 19900,
  'EZ Waitlist': 2999,
  'QuotesAI': 2999,
  'Designfast': 2999,
  'Retro': 2999,
  'EZ Haze': 7900,
  'EZ Blog': 9900,
  'EZ Chatbot': 9900,
  'EZ AI': 19900,
  'EZ Portfolio II': 9900,
  'EZ SaaS': 19900,
  'Create New Component': 2999,
  'EZ AI Content': 2999,
  'Pages Plan': 49900,
  'Multi Page Website Plan': 89900,
};

export function formatPrice(cents: number) {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}
