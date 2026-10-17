import '@/styles/globals.css';
import '@/styles/admin.css';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata = {
  metadataBase: new URL('https://www.atzyncmedia.com'),
  title: {
    default: 'ATZYNC MEDIA — A Mint of Creativity | Video Production & Marketing',
    template: '%s | ATZYNC MEDIA',
  },
  description:
    'ATZYNC MEDIA — A Mint of Creativity. High-impact Branding Films, Commercials, Social Media Videos, and Digital Marketing engineered for modern brands.',
  keywords: [
    'ATZYNC MEDIA',
    'Branding Films',
    'Commercials',
    'Social Media Videos',
    'Digital Marketing',
    'Video Production',
    'Commercial Ad Film',
    'Meta Ads',
    'Post Production',
    'Creative Studio',
  ],
  authors: [{ name: 'ATZYNC MEDIA' }],
  creator: 'ATZYNC MEDIA',
  publisher: 'ATZYNC MEDIA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ATZYNC MEDIA — A Mint of Creativity | Video Production & Marketing',
    description:
      'ATZYNC MEDIA — A Mint of Creativity. High-impact Branding Films, Commercials, Social Media Videos, and Digital Marketing engineered for modern brands.',
    url: 'https://www.atzyncmedia.com/',
    siteName: 'ATZYNC MEDIA',
    images: [
      {
        url: '/images/hero-poster.webp',
        width: 960,
        height: 536,
        alt: 'ATZYNC MEDIA — A Mint of Creativity',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATZYNC MEDIA — A Mint of Creativity | Video Production & Marketing',
    description:
      'ATZYNC MEDIA — A Mint of Creativity. High-impact Branding Films, Commercials, Social Media Videos, and Digital Marketing engineered for modern brands.',
    images: ['/images/hero-poster.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo-black.webp', type: 'image/webp' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.atzyncmedia.com/#website',
      url: 'https://www.atzyncmedia.com/',
      name: 'ATZYNC MEDIA',
      alternateName: 'ATZYNCMEDIA',
      description:
        'ATZYNC MEDIA — A Mint of Creativity. High-impact Branding Films, Commercials, Social Media Videos, and Digital Marketing.',
      publisher: {
        '@id': 'https://www.atzyncmedia.com/#organization',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.atzyncmedia.com/#organization',
      name: 'ATZYNC MEDIA',
      alternateName: 'ATZYNCMEDIA',
      url: 'https://www.atzyncmedia.com/',
      logo: 'https://www.atzyncmedia.com/logo-white.png',
      slogan: 'A Mint of Creativity',
      description:
        'Premium video production and digital marketing studio crafting high-impact Branding Films, Commercials, Social Media Videos, and Digital Marketing.',
      founder: {
        '@type': 'Person',
        name: 'Thomash Murugesan',
        jobTitle: 'Managing Director',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91 9597127710',
          contactType: 'customer service',
          email: 'atzyncmedia@gmail.com',
        },
      ],
      sameAs: [
        'https://www.instagram.com/atzyncmedia?stkn=NXJyZDZiNXFjYjg5',
        'https://linkedin.com/company/atzyncmedia',
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
