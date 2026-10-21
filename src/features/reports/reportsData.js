export const REPORT_CATEGORIES = [
  { id: "love", name: "Love and Marriage" },
  { id: "money", name: "Money" },
  { id: "work", name: "Work" },
  { id: "self", name: "Self and Growth" },
]

export const REPORTS_CATALOG = [
  // Love and Marriage
  {
    slug: "love-style",
    category: "love",
    categoryName: "Love and Marriage",
    title: "Love Style",
    subtitle: "Your style and strengths in romance",
    badge: null,
    isLocked: true,
    description:
      "A deep Vedic dive into your 5th house, Venus placement, and romantic instincts. Understand how you love, communicate affection, and navigate vulnerability in relationships.",
    dashaFocus: "Venus & 5th Lord transits",
    vaaniPrompt: "What does my 5th house and Venus say about my romantic style and emotional strengths?",
  },
  {
    slug: "marriage",
    category: "love",
    categoryName: "Love and Marriage",
    title: "Marriage",
    subtitle: "Early or delayed marriage? Yogas, timing & remedies",
    badge: "Trending",
    isLocked: true,
    description:
      "A Vedic marriage report reads the seventh house, its lord, Venus and the Navamsa (D9) to say when marriage is most likely and what the marriage itself will feel like. AstroTring prepares it from your own birth chart, naming the Dasha and transit windows that carry the strongest marriage yoga rather than one fixed date.",
    dashaFocus: "7th Lord, Jupiter & Navamsa (D9)",
    vaaniPrompt: "When is marriage most likely according to my 7th house and current Mahadasha?",
  },
  {
    slug: "ideal-partner",
    category: "love",
    categoryName: "Love and Marriage",
    title: "Ideal Partner",
    subtitle: "Your ideal life partner",
    badge: null,
    isLocked: true,
    description:
      "Analyzes your 7th house cusp, Darakaraka planet, and Navamsa descendant to sketch the temperament, values, and vocational background of your most harmonious match.",
    dashaFocus: "Darakaraka & 7th Bhava",
    vaaniPrompt: "What does my chart reveal about the temperament and personality of my ideal partner?",
  },
  {
    slug: "love-arrange",
    category: "love",
    categoryName: "Love and Marriage",
    title: "Love or Arrange",
    subtitle: "What suits you the best?",
    badge: "New",
    isLocked: true,
    description:
      "Evaluates the interplay between the 5th house (romance) and 9th/11th houses (tradition and family blessings) to forecast whether love or an arranged match offers greater karmic stability.",
    dashaFocus: "5th house vs 9th house harmony",
    vaaniPrompt: "Does my chart favor a love marriage or an arranged marriage for long-term peace?",
  },
  {
    slug: "spouse",
    category: "love",
    categoryName: "Love and Marriage",
    title: "Spouse",
    subtitle: "Bond and connection with your spouse",
    badge: null,
    isLocked: true,
    description:
      "Explore the spiritual and emotional bond with your spouse. Unpacks shared life goals, conflict resolution patterns, and long-term companionship from your Navamsa (D9) chart.",
    dashaFocus: "Navamsa Lagna & 7th house",
    vaaniPrompt: "How will my bond with my future spouse evolve over time according to my D9 chart?",
  },
  {
    slug: "in-laws",
    category: "love",
    categoryName: "Love and Marriage",
    title: "In-Laws",
    subtitle: "How to manage expectations?",
    badge: null,
    isLocked: true,
    description:
      "A specialized examination of the 8th house (family of spouse) and 2nd house from the 7th to foresee family dynamics and establish healthy mutual respect after marriage.",
    dashaFocus: "8th Bhava & Saturn aspects",
    vaaniPrompt: "What does my 8th house indicate about my relationship with my in-laws?",
  },

  // Money
  {
    slug: "billionaire",
    category: "money",
    categoryName: "Money",
    title: "Billionaire Potential",
    subtitle: "Bill Gates or Mukesh Ambani? Find your destiny",
    badge: "Trending",
    isLocked: true,
    description:
      "Scans your chart for classical Dhana Yogas, Lakshmi Yoga, Vipreet Raja Yogas, and Indu Lagna strength to determine peak wealth thresholds and enterprise potential.",
    dashaFocus: "Indu Lagna, 2nd & 11th Lords",
    vaaniPrompt: "Are there any rare Dhana Yogas or billionaire combinations in my birth chart?",
  },
  {
    slug: "wealth",
    category: "money",
    categoryName: "Money",
    title: "Wealth",
    subtitle: "Quick wealth creation",
    badge: null,
    isLocked: true,
    description:
      "Analyzes your 2nd house of accumulated assets, 11th house of recurrent profits, and Jupiter transits to map your timeline for savings, real estate, and capital investments.",
    dashaFocus: "Jupiter transits & 11th house",
    vaaniPrompt: "What are the key wealth creation windows in my upcoming Mahadasha cycles?",
  },

  // Work
  {
    slug: "career",
    category: "work",
    categoryName: "Work",
    title: "Career",
    subtitle: "Career growth for corporate employees",
    badge: "Trending",
    isLocked: true,
    description:
      "Examines your 10th house, Amatyakaraka, and Dasamsa (D10) chart to map optimal promotion cycles, executive leadership windows, and strategic moments to seek role expansion.",
    dashaFocus: "10th Lord & Dasamsa (D10)",
    vaaniPrompt: "What does my 10th house and Dasamsa say about my corporate career trajectory?",
  },
  {
    slug: "business",
    category: "work",
    categoryName: "Work",
    title: "Business",
    subtitle: "How to grow your business?",
    badge: null,
    isLocked: true,
    description:
      "Built for founders and entrepreneurs. Evaluates the 7th house of trade, Mercury's commercial intelligence, and Rahu's market timing to identify prime expansion phases.",
    dashaFocus: "7th house & Mercury dignity",
    vaaniPrompt: "When is the most auspicious window to launch or expand my business venture?",
  },
  {
    slug: "job-or-business",
    category: "work",
    categoryName: "Work",
    title: "Job or Business",
    subtitle: "A stable job, a bold business, or both?",
    badge: null,
    isLocked: true,
    description:
      "A head-to-head comparison between your 6th house (employment/service) and 7th/10th houses (independent venture) to determine where your chart yields maximum prosperity.",
    dashaFocus: "6th house vs 7th house comparison",
    vaaniPrompt: "Am I naturally built for a corporate job or should I pursue independent business?",
  },
  {
    slug: "govt-job",
    category: "work",
    categoryName: "Work",
    title: "Govt Job",
    subtitle: "Selection, promotion and growth in your service",
    badge: "New",
    isLocked: true,
    description:
      "Calculates the strength of Sun (state authority), Mars (administrative power), and 10th house connection to predict competitive exam success and civil service eligibility.",
    dashaFocus: "Sun dignity & 10th Lord aspects",
    vaaniPrompt: "What is my probability of clearing government or civil service examinations?",
  },
  {
    slug: "first-job",
    category: "work",
    categoryName: "Work",
    title: "First Job",
    subtitle: "Your first career move",
    badge: null,
    isLocked: true,
    description:
      "Tailored for students and recent graduates. Identifies the strongest industry sectors and key astrological months for campus placements and entry-level offers.",
    dashaFocus: "Antardasha periods & Mercury transit",
    vaaniPrompt: "Which industry or domain should I target for my first job offer?",
  },
  {
    slug: "job-search",
    category: "work",
    categoryName: "Work",
    title: "Job Search",
    subtitle: "Re-enter the job market with passion",
    badge: null,
    isLocked: true,
    description:
      "Pinpoints upcoming Gochara transit favorable windows for interviews, salary negotiations, and high-impact career transitions after a sabbatical or career break.",
    dashaFocus: "6th Lord & Jupiter Gochara",
    vaaniPrompt: "When will my job search yield concrete offers and salary growth?",
  },

  // Self and Growth
  {
    slug: "personality-intelligence",
    category: "self",
    categoryName: "Self and Growth",
    title: "Personality & Intelligence",
    subtitle: "Cognitive profile, intellectual gifts, and learning strengths",
    badge: null,
    isLocked: true,
    description:
      "A deep psychological and Vedic portrait of your intellect. Explores Mercury's analytical grasp, Jupiter's wisdom, and 5th house creativity to guide lifelong learning.",
    dashaFocus: "5th Bhava & Budhaditya Yoga",
    vaaniPrompt: "What are my primary cognitive strengths and intellectual gifts according to my chart?",
  },
]
