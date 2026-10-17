export const metadata = {
  title: 'Selected Work & Portfolio',
  description:
    'Explore high-impact branding films, commercial ads, social media videos, and performance digital creative produced by ATZYNC MEDIA.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Selected Work & Portfolio | ATZYNC MEDIA',
    description:
      'Explore high-impact branding films, commercial ads, social media videos, and performance digital creative produced by ATZYNC MEDIA.',
    url: 'https://www.atzyncmedia.com/work',
    siteName: 'ATZYNC MEDIA',
    images: [
      {
        url: '/images/hero-poster.webp',
        width: 960,
        height: 536,
        alt: 'ATZYNC MEDIA — Selected Work & Showreel',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selected Work & Portfolio | ATZYNC MEDIA',
    description:
      'Explore high-impact branding films, commercial ads, social media videos, and performance digital creative produced by ATZYNC MEDIA.',
    images: ['/images/hero-poster.webp'],
  },
};

export default function WorkLayout({ children }) {
  return children;
}

