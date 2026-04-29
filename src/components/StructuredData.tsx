import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Product {
  id: string;
  name: string;
  image: string;
  description?: string;
  price: number;
  currency: string;
  stockStatus: 'inStock' | 'outOfStock' | 'backorder';
  rating?: number;
  reviews?: number;
}

interface ProductSchemaProps {
  product: Product;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description || product.name,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "DEKNA"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": product.stockStatus === 'inStock' 
        ? "https://schema.org/InStock" 
        : product.stockStatus === 'backorder'
        ? "https://schema.org/BackOrder"
        : "https://schema.org/OutOfStock",
      "url": typeof window !== 'undefined' ? window.location.href : ''
    },
    ...(product.rating && product.reviews && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviews
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const OrganizationSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DEKNA Kids Goods Shop",
    "alternateName": "DEKNA",
    "url": "https://dekna.com",
    "logo": "https://dekna.com/logo.png",
    "description": "Premium kids goods, toys, books, and essentials e-commerce store",
    "sameAs": [
      "https://www.facebook.com/dekna",
      "https://www.instagram.com/dekna",
      "https://www.youtube.com/@DEKNA_21"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English"]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const WebSiteSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DEKNA Kids Goods Shop",
    "url": "https://dekna.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://dekna.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
