import Script from 'next/script';
import { testimonials } from './home/data';

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Karuna Technologies",
    "url": "https://karunatech.ca",
    "logo": "https://karunatech.ca/logo.png", // Replace with actual logo URL
    "sameAs": [
      "https://www.linkedin.com/company/karuna-tech", // Replace with your actual links
      "https://github.com/karunatech"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-123-456-7890", // Replace with your phone
      "contactType": "customer service",
      "areaServed": "US",
      "availableLanguage": "English"
    }
  };

  // If you have a physical location, add LocalBusiness
  // const localBusinessSchema = { ... };

  // If you want to list services (you can fetch from your data.ts)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Service",
        "name": "Web Design & Development",
        "description": "From pixel-perfect landing pages to complex web applications...",
        "provider": { "@type": "Organization", "name": "Karuna Technologies" }
      },
      // add all four services from data.ts
    ]
  };

  // Testimonials schema (you can map from data.ts)
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": testimonials.map((t, i) => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": t.author },
      "reviewBody": t.quote,
      "reviewRating": { "@type": "Rating", "ratingValue": 5 } // you can set dynamically
    }))
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* <Script id="service-schema" ... /> */}
    </>
  );
}