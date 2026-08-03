import { Await, useLoaderData, Link } from 'react-router';
import { Suspense } from 'react';
import Hero from '~/components/Hero';
import { ProductItem } from '~/components/ProductItem';
import { MockShopNotice } from '~/components/MockShopNotice';
import { ImageWithText } from '~/components/ImageWithText';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Money, Image } from '@shopify/hydrogen';
import { FeaturedProduct } from '~/components/FeaturedProduct';
import Testimonials from '~/components/Testimonials';
import RichText from '~/components/RichText';
import {BlogSlider} from '~/components/BlogSlider';


import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

 
/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: 'Hydrogen | Home' }];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);
  

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context }) {
  const [
    { collection: menCollection },
    { collection: womenCollection },
    { products },
  ] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    context.storefront.query(WOMEN_COLLECTION_QUERY),
    context.storefront.query(FEATURED_PRODUCT_QUERY),
  ]);


  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: menCollection,
    womenCollection,
    featuredProduct: products.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context }) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  const blogs = context.storefront
    .query(BLOGS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
    blogs,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <Hero />
      {data.isShopLinked ? null : <MockShopNotice />}
      <RichText />
      <FeaturedCollection collection={data.featuredCollection} />
    
      <ImageWithText
        image="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600"
        heading="Women's Collection"
        description="Explore our exclusive women's collection featuring the latest arrivals, seasonal trends, and wardrobe essentials. Designed with premium materials and exceptional craftsmanship, every piece offers the perfect balance of style, comfort, and quality. Find your next favorite outfit and enjoy fashion that complements every moment of your lifestyle."
        buttonText="Shop Women"
        buttonLink="/collections/women"
      />
      <ImageWithText
        image="https://images.unsplash.com/photo-1504593811423-6dd665756598?w=1600"
        heading="Men's Collection"
        description="Discover premium men's fashion designed for comfort and style.Explore our exclusive women's collection featuring the latest arrivals, seasonal trends, and wardrobe essentials. Designed with premium materials and exceptional craftsmanship, every piece offers the perfect balance of style, comfort, and quality. Find your next favorite outfit and enjoy fashion that complements every moment of your lifestyle."
        buttonText="Shop Men"
        buttonLink="/collections/men"
        reverse={true}
      />
      <FeaturedCollection collection={data.womenCollection} />
      <section className="my-0 px-8">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
          alt="Banner"
          className="w-full h-[250px] md:h-[350px] lg:h-[450px] object-cover rounded-2xl"
        />
      </section>
      <Testimonials />
      <Suspense fallback={<p>Loading blogs...</p>}>
        <Await resolve={data.blogs}>
          {(blogs) => <BlogSlider blogs={blogs} />}
        </Await>
      </Suspense>
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({ collection }) {
  if (!collection?.products?.nodes?.length) return null;

  return (
    <section className="section_heading py-10">
      <h2 className="text-3xl font-bold text-center mb-6">
        {collection.title}
      </h2>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {collection.products.nodes.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductItem product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({ products }) {
  return (
    <section
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <h2 id="recommended-products">Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {response
                ? response.products.nodes.map((product) => (
                  <SwiperSlide key={product.id}>
                    <ProductItem product={product} />
                  </SwiperSlide>
                ))
                : null}
            </Swiper>
          )}
        </Await>
      </Suspense>
      <br />
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
fragment FeaturedCollection on Collection {
  id
  title
  image {
    id
    url
    altText
    width
    height
  }
  handle

  products(first: 8) {
    nodes {
      id
      title
      handle

      selectedOrFirstAvailableVariant {
        id
      }

      featuredImage {
        id
        url
        altText
        width
        height
      }

      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}

query FeaturedCollection(
  $country: CountryCode,
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: "men") {
    ...FeaturedCollection
  }
}
`;

const WOMEN_COLLECTION_QUERY = `#graphql
fragment WomenCollection on Collection {
  id
  title
  image {
    id
    url
    altText
    width
    height
  }
  handle

  products(first: 8) {
    nodes {
      id
      title
      handle

      selectedOrFirstAvailableVariant {
        id
      }

      featuredImage {
        id
        url
        altText
        width
        height
      }

      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}

query WomenCollection(
  $country: CountryCode,
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: "women") {
    ...WomenCollection
  }
}
`;

const FEATURED_PRODUCT_QUERY = `#graphql
query FeaturedProduct(
  $country: CountryCode,
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  products(first: 1, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id
      title
      handle
      description
      vendor
      productType
      tags

      featuredImage {
        id
        url
        altText
        width
        height
      }

      images(first: 10) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }

      options {
        name
        optionValues {
          name
        }
      }

      selectedOrFirstAvailableVariant {
        id
        availableForSale
        sku

        price {
          amount
          currencyCode
        }

        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
`;
const BLOGS_QUERY = `#graphql
query HomeBlog(
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {

  blog(handle: "mercer-media") {
    id
    title
    handle

    articles(first: 6) {
      nodes {
        id
        handle
        title
        excerpt

        image {
          url
          altText
          width
          height
        }
      }
    }
  }
}
`;
const RECOMMENDED_PRODUCTS_QUERY = `#graphql
fragment RecommendedProduct on Product {
  id
  title
  handle

  selectedOrFirstAvailableVariant {
    id
  }

  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }

  featuredImage {
    url
    altText
  }
}

query HomeRecommendedProducts(
  $country: CountryCode,
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  products(first: 8, sortKey: UPDATED_AT, reverse: true) {
    nodes {
      ...RecommendedProduct
    }
  }
}
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
