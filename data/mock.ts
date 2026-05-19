export const funds = [
  {
    id: 1,
    name: 'Impact Growth II',
    closeDate: '25/02/2029',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    description: [
      'Financement early-stage pour startups innovantes',
      "Accompagnement stratégique et accès à un réseau d'experts",
      'Focus sur des modèles scalables et à fort potentiel',
    ],
    docs: ['One Pager Venture II', 'Deck Venture II'],
  },
  {
    id: 2,
    name: 'Flex II',
    closeDate: '02/12/2026',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    description: ["Capital pour accélérer l'expansion et structurer la croissance"],
    docs: [],
  },
  {
    id: 3,
    name: 'Venture I',
    closeDate: undefined,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    description: ['Solutions hybrides entre capital-développement et dette privée'],
    docs: [],
  },
  { id: 4, name: 'Fonds A', closeDate: undefined, image: null, description: [] },
  { id: 5, name: 'Fonds B', closeDate: undefined, image: null, description: [] },
];

export const subscriptions = [
  { id: 1, fund: 'Fonds Licorne VI', part: 'Part A', date: '15/01/2025', amount: 100000, called: 0, distributed: 0, valuation: null, status: 'to_sign' },
  { id: 2, fund: 'Fonds Licorne VI', part: 'Part C', date: '15/01/2025', amount: 100, called: 0, distributed: 0, valuation: null, status: 'in_progress' },
  { id: 3, fund: 'Fonds Licorne VI', part: 'Part A', date: '15/01/2025', amount: 300000, called: 0, distributed: 0, valuation: null, status: 'valid' },
  { id: 4, fund: 'Flex II', part: null, date: '03/02/2025', amount: 100, called: 9.90, distributed: 0, valuation: null, status: 'valid' },
  { id: 5, fund: 'Flex II', part: 'A1', date: '09/07/2025', amount: 250000, called: 0, distributed: 0, valuation: null, status: 'in_progress' },
];

export const portfolioKpis = {
  totalEngagement: 300100,
  totalCalled: 10,
  totalDistributed: 0,
  valuation: 125,
};

export const documents = [
  { id: 1, fund: 'FONDS A', name: 'DOC - FONDS A', type: 'PDF', size: '383.31 Ko', addedAt: '04/05/2026', isNew: true },
  { id: 2, fund: 'FONDS A', name: 'DOC - FONDS A - Souscription S1', type: 'PDF', size: '383.31 Ko', addedAt: '04/05/2026', isNew: true },
  { id: 3, fund: 'FONDS A', name: 'DOC - FONDS A - Souscription S2', type: 'PDF', size: '383.31 Ko', addedAt: '04/05/2026', isNew: true },
  { id: 4, fund: 'FONDS B', name: 'DOC - FONDS B - Notice', type: 'PDF', size: '210.00 Ko', addedAt: '01/05/2026', isNew: false },
  { id: 5, fund: 'FONDS B', name: 'DOC - FONDS B - Bulletin S1', type: 'PDF', size: '145.00 Ko', addedAt: '01/05/2026', isNew: false },
];

export const secondaryMarket = [
  {
    id: 1,
    fund: 'Fonds Secondaire',
    part: 'PART A',
    shares: 1000,
    price: 100,
    validUntil: '30/08/2026',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    navPerShare: 118.50,
    navDate: '30/04/2026',
    status: 'available' as const,
  },
  {
    id: 2,
    fund: 'Fonds Secondaire',
    part: 'PART B',
    shares: 500,
    price: 95,
    validUntil: '15/07/2026',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    navPerShare: 118.50,
    navDate: '30/04/2026',
    status: 'pending' as const,
    pendingSince: '12/05/2026',
  },
  {
    id: 3,
    fund: 'Impact Growth II',
    part: 'PART A',
    shares: 250,
    price: 210,
    validUntil: '01/09/2026',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    navPerShare: 198.75,
    navDate: '30/04/2026',
    status: 'available' as const,
  },
];

export const navPerformance = Array.from({ length: 24 }, (_, i) => {
  const date = new Date(2024, i, 1);
  return {
    date: date.toISOString().split('T')[0],
    nav: 100 + Math.round(Math.sin(i / 3) * 15 + i * 2.5),
  };
});
