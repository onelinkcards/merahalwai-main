const FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80&auto=format&fit=crop";

const BY_NAME: Record<string, string> = {
  "Paneer Tikka":
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80&auto=format&fit=crop",
  "Chicken Tikka":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80&auto=format&fit=crop",
  "Mutton Rogan Josh":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80&auto=format&fit=crop",
  "Butter Chicken":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80&auto=format&fit=crop",
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80&auto=format&fit=crop",
  "Dal Makhani":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80&auto=format&fit=crop",
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80&auto=format&fit=crop",
  "Veg Dum Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80&auto=format&fit=crop",
  "Butter Naan":
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80&auto=format&fit=crop",
  "Gulab Jamun":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80&auto=format&fit=crop",
  "Ras Malai":
    "https://images.unsplash.com/photo-1631452180762-fd50245d1c90?w=300&q=80&auto=format&fit=crop",
  Kheer:
    "https://images.unsplash.com/photo-1571167530149-c1105da4b1ac?w=300&q=80&auto=format&fit=crop",
  Falooda:
    "https://images.unsplash.com/photo-1619895092538-128341789043?w=300&q=80&auto=format&fit=crop",
  Mocktail:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80&auto=format&fit=crop",
  "Mango Lassi":
    "https://images.unsplash.com/photo-1626200419199-391ae4be7a4a?w=300&q=80&auto=format&fit=crop",
  "Fresh Lime Soda":
    "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&q=80&auto=format&fit=crop",
  "Sweet Corn Soup":
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80&auto=format&fit=crop",
  "Tomato Soup":
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80&auto=format&fit=crop",
  "Tomato Shorba":
    "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80&auto=format&fit=crop",
  Jalebi:
    "https://images.unsplash.com/photo-1605197588427-4ff1f40e6435?w=300&q=80&auto=format&fit=crop",
};

const BY_KEYWORD: Array<{ match: string[]; image: string; text: string }> = [
  {
    match: ["soup", "shorba", "manchow", "clear", "coriander"],
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80&auto=format&fit=crop",
    text: "Warm, balanced, and suited for the first course",
  },
  {
    match: ["lassi", "sharbat", "soda", "chaas", "jaljeera", "coffee"],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=80&auto=format&fit=crop",
    text: "Cooling welcome drink for quick service counters",
  },
  {
    match: ["tikka", "kabab", "kebab", "pakora", "65", "roll", "cutlet", "fry", "finger", "corn"],
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80&auto=format&fit=crop",
    text: "Popular starter pick for live service and buffet openings",
  },
  {
    match: ["paneer", "kofta", "veg", "chole", "bhindi", "dum aloo", "matar", "gobi"],
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80&auto=format&fit=crop",
    text: "Rich North Indian curry with banquet-friendly portions",
  },
  {
    match: ["chicken", "mutton", "fish", "egg"],
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80&auto=format&fit=crop",
    text: "High-demand non-veg favorite for wedding and city event menus",
  },
  {
    match: ["dal", "rajma", "kadhi", "legume", "chana"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80&auto=format&fit=crop",
    text: "Comfort-style staple that rounds out the mains well",
  },
  {
    match: ["rice", "biryani", "pulao", "bath", "chawal"],
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80&auto=format&fit=crop",
    text: "Batch-friendly rice selection for buffet service",
  },
  {
    match: ["naan", "roti", "paratha", "kulcha", "poori", "chapati", "rumali", "bhakri"],
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80&auto=format&fit=crop",
    text: "Fresh bread service paired with mains and curries",
  },
  {
    match: ["raita", "papad", "salad", "chutney"],
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80&auto=format&fit=crop",
    text: "Cooling side to balance richer curries and biryani",
  },
  {
    match: ["jamun", "rasgulla", "halwa", "kheer", "malai", "kulfi", "dessert", "jalebi"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80&auto=format&fit=crop",
    text: "Sweet finish that works well across weddings and family events",
  },
];

export function getMenuItemImageUrl(itemName: string): string {
  const direct = BY_NAME[itemName];
  if (direct) return direct;

  const lower = itemName.toLowerCase();
  const keywordMatch = BY_KEYWORD.find((entry) =>
    entry.match.some((token) => lower.includes(token))
  );

  return keywordMatch?.image ?? FALLBACK;
}

export function shortMenuDescription(itemName: string): string {
  const lower = itemName.toLowerCase();
  const keywordMatch = BY_KEYWORD.find((entry) =>
    entry.match.some((token) => lower.includes(token))
  );
  return keywordMatch?.text ?? "Structured banquet pick from the current package menu";
}
