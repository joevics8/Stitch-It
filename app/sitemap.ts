import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-it.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/measure', '/about', '/contact', '/faq', '/privacy', '/terms'];
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : route === '/measure' ? 0.9 : 0.5,
  }));
}

export const revalidate = 3600;
