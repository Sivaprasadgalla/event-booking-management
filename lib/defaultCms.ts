export interface CmsNavLink {
  id?: string;
  label: string;
  href: string;
  isHighlighted?: boolean;
}

export interface CmsFooterColumn {
  id?: string;
  title: string;
  links: { label: string; href: string }[];
}

export interface CmsData {
  header: {
    brandName: string;
    brandTagline: string;
    searchPlaceholder: string;
    announcement: {
      enabled: boolean;
      text: string;
      linkText: string;
      linkUrl: string;
    };
    navLinks: CmsNavLink[];
  };
  footer: {
    brandDescription: string;
    copyrightText: string;
    columns: CmsFooterColumn[];
    trustBadges: { text: string }[];
    socialLinks: {
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      facebook?: string;
    };
  };
  hero: {
    badgeText: string;
    title: string;
    highlightedTitle: string;
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    stats: { label: string; value: string }[];
  };
  occasions: { label: string; href: string; color?: string }[];
}

export const DEFAULT_CMS_DATA: CmsData = {
  header: {
    brandName: "CelebrateHub",
    brandTagline: "Venue & Hosting",
    searchPlaceholder: "Search rooftops, villas, banquets, occasions...",
    announcement: {
      enabled: true,
      text: "✨ Exclusive Celebration Offer: Instant 10-Minute Cart Slot Holds & Verified Passes!",
      linkText: "Browse Venues",
      linkUrl: "/events",
    },
    navLinks: [
      { label: "All Venues", href: "/events" },
      { label: "Rooftops", href: "/events?category=rooftops" },
      { label: "Farmhouses & Villas", href: "/events?category=farmhouses-villas" },
      { label: "Banquets", href: "/events?category=banquets" },
      { label: "Garden & Beach Lawns", href: "/events?category=garden-lawns" },
    ],
  },
  footer: {
    brandDescription:
      "The premier celebration venue & hosting partner marketplace. Reserve private rooftops, luxury farmhouses, and grand ballrooms for birthdays, anniversaries, and unforgettable milestones.",
    copyrightText: "© 2026 CelebrateHub Technologies Inc. All rights reserved.",
    columns: [
      {
        title: "Celebration Venues",
        links: [
          { label: "Rooftops & Sky Lounges", href: "/events?category=rooftops" },
          { label: "Private Farmhouses & Pool Villas", href: "/events?category=farmhouses-villas" },
          { label: "Grand Ballrooms & Banquets", href: "/events?category=banquets" },
          { label: "Garden & Beachfront Lawns", href: "/events?category=garden-lawns" },
          { label: "Intimate Speakeasies & Cellars", href: "/events?category=boutique-venues" },
        ],
      },
      {
        title: "For Hosting Partners",
        links: [
          { label: "Join as Venue Partner", href: "/register" },
          { label: "Partner Dashboard", href: "/organiser/dashboard" },
          { label: "List Celebration Venue", href: "/organiser/events/new" },
          { label: "Guest Verification & Check-In", href: "/organiser/bookings" },
        ],
      },
      {
        title: "Platform & Concierge",
        links: [
          { label: "Customer Protection & Fair Refunds", href: "/customer/bookings" },
          { label: "Venue Safety Standards", href: "/events" },
          { label: "Terms of Service", href: "#" },
          { label: "Administrator Portal", href: "/admin/dashboard" },
        ],
      },
    ],
    trustBadges: [
      { text: "100% Verified Partners" },
      { text: "Razorpay 256-bit Encrypted" },
      { text: "Instant QR Passes" },
    ],
    socialLinks: {
      instagram: "https://instagram.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
  },
  hero: {
    badgeText: "India's Premier Venue & Celebration Partner Marketplace",
    title: "Celebrate Life's Moments at",
    highlightedTitle: "Dream Venues.",
    subtitle:
      "Discover and reserve private celebration venues: Rooftop lounges, pool farmhouses, luxury banquets, and boutique estates for birthday parties, anniversaries, and milestone celebrations.",
    primaryCta: { label: "Explore All Venues", href: "/events" },
    secondaryCta: { label: "Host Celebrations", href: "/register" },
    stats: [
      { label: "Verified Venues", value: "100%" },
      { label: "Parties Hosted", value: "45,000+" },
      { label: "Host Net Payout", value: "95%" },
      { label: "Hold Window", value: "10 Mins" },
    ],
  },
  occasions: [
    { label: "Birthday Bashes", href: "/events?search=Birthday", color: "pink" },
    { label: "Romantic Anniversaries", href: "/events?search=Anniversary", color: "rose" },
    { label: "Rooftop Sundowners", href: "/events?search=Rooftop", color: "purple" },
    { label: "Private Farmhouses", href: "/events?search=Farmhouse", color: "emerald" },
    { label: "Weddings & Engagements", href: "/events?search=Wedding", color: "amber" },
    { label: "Corporate Galas", href: "/events?search=Corporate", color: "indigo" },
  ],
};
