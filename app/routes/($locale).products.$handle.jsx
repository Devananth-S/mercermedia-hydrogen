import { useLoaderData, Await } from 'react-router';
import { Suspense, useEffect } from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { ProductPrice } from '~/components/ProductPrice';
import { ProductImage } from '~/components/ProductImage';
import { ProductForm } from '~/components/ProductForm';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { RelatedProducts } from '~/components/RelatedProducts';
import { getReviews } from '~/lib/judgeme.server';
import { RichText } from '@shopify/hydrogen';


/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  return [
    { title: `Hydrogen | ${data?.product.title ?? ''}` },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: product });

  return {
    product,
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

  const reviews = getReviews(context.env).catch((error) => {
    console.error("Judge.me Error:", error);
    return null;
  });

  return {
    recommendedProducts,
    reviews,
  };
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const { product, recommendedProducts, reviews } = useLoaderData();



  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });



  const { title, descriptionHtml } = product;

  const featureImage1 = product.metafields?.find(
    (item) => item?.key === "product_descrption_one_image",
  );

  const featureContent1 = product.metafields?.find(
    (item) => item?.key === "product_descrption_one_content",
  );

  const featureImage2 = product.metafields?.find(
    (item) => item?.key === "product_descrption_two_image",
  );

  const featureContent2 = product.metafields?.find(
    (item) => item?.key === "product_descrption_two_content",
  );


  useEffect(() => {
    if (window.jdgm && typeof window.jdgm.init === 'function') {
      window.jdgm.init();
    }
  }, [product.id]);


  return (
    <>
      <div className="product">
        <ProductImage
          image={selectedVariant?.image}
          images={product.images.nodes}
        />

        <div className="product-main">
          <h1>{title}</h1>
          <Suspense fallback={null}>
            <Await resolve={reviews}>
              {(data) => {
                const productReviews =
                  data?.reviews?.filter(
                    (review) => review.product_handle === product.handle,
                  ) || [];

                const reviewCount = productReviews.length;

                const averageRating =
                  reviewCount > 0
                    ? (
                      productReviews.reduce((sum, review) => sum + review.rating, 0) /
                      reviewCount
                    ).toFixed(1)
                    : "0.0";

                return (
                  <div className="product-reviews">
                    <span style={{ color: "#f5a623", fontSize: "18px" }}>
                      ⭐⭐⭐⭐⭐
                    </span>
                    <span style={{ marginLeft: "8px" }}>
                      {averageRating} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                    </span>
                  </div>
                );
              }}
            </Await>
          </Suspense>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          <details className="product-accordion">
            <summary>Description</summary>

            <div
              className="accordion-content"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </details>
          <div className="trust-badges">
            <div className="trust-item">
              <img
                src="https://img.icons8.com/fluency/48/delivery.png"
                alt="Fast Delivery"
              />
              <span>Fast Delivery</span>
            </div>

            <div className="trust-item">
              <img
                src="https://img.icons8.com/fluency/48/return-purchase.png"
                alt="Easy Returns"
              />
              <span>7-Day Returns</span>
            </div>

            <div className="trust-item">
              <img
                src="https://img.icons8.com/fluency/48/lock-2.png"
                alt="Secure Payment"
              />
              <span>Secure Payment</span>
            </div>

            <div className="trust-item">
              <img
                src="https://img.icons8.com/fluency/48/verified-account.png"
                alt="Quality"
              />
              <span>100% Quality Assured</span>
            </div>
          </div>
        </div>

        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>

      {featureImage1 && (
        <div className="feature-section right_text">
          <div className="feature-image">
            <img
              src={featureImage1.reference?.image?.url}
              alt={featureImage1.reference?.image?.altText || ""}
            />
          </div>

          <div className="feature-content">
            {(() => {
              const richContent = JSON.parse(featureContent1.value);

              return richContent.children.map((block, index) => {
                if (block.type === "heading") {
                  return (
                    <h2 key={index}>
                      {block.children.map((c) => c.value).join("")}
                    </h2>
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <p key={index}>
                      {block.children.map((c) => c.value).join("")}
                    </p>
                  );
                }

                return null;
              });
            })()}
          </div>
        </div>
      )}

      {featureImage2 && (
        <div className="feature-section reverse left_text">
          <div className="feature-image">
            <img
              src={featureImage2.reference?.image?.url}
              alt={featureImage2.reference?.image?.altText || ""}
            />
          </div>

          <div className="feature-content">
            {(() => {
              const richContent = JSON.parse(featureContent2.value);

              return richContent.children.map((block, index) => {
                if (block.type === "heading") {
                  return (
                    <h2 key={index}>
                      {block.children.map((c) => c.value).join("")}
                    </h2>
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <p key={index}>
                      {block.children.map((c) => c.value).join("")}
                    </p>
                  );
                }

                return null;
              });
            })()}
          </div>
        </div>
      )}

      <div
        className="jdgm-widget jdgm-review-widget"
        data-id={product.id.replace("gid://shopify/Product/", "")}
      />
      <Suspense fallback={<p>Loading reviews...</p>}>
        <Await resolve={reviews}>
          {(data) => {
            const productReviews =
              data?.reviews?.filter(
                (review) => review.product_handle === product.handle,
              ) || [];

            return (
              <div className="reviews-section">
                <h2>Customer Reviews</h2>

                {productReviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  productReviews.map((review) => {

                    return (
                      <div className="review-card" key={review.id}>
                        <h4>{review.reviewer.name}</h4>

                        <p>{"⭐".repeat(review.rating)}</p>

                        <p>{review.body}</p>


                      </div>
                    );
                  })
                )}
              </div>
            );
          }}
        </Await>
      </Suspense>



      <Suspense fallback={<p>Loading related products...</p>}>
        <Await resolve={recommendedProducts}>
          {(data) => (
            <RelatedProducts products={data.products.nodes} />
          )}
        </Await>
      </Suspense>


    </>
  );
}





const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
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
    metafields(
      identifiers: [
        {
          namespace: "custom"
          key: "product_descrption_one_image"
        }
        {
          namespace: "custom"
          key: "product_descrption_one_content"
        }
        {
          namespace: "custom"
          key: "product_descrption_two_image"
        }
        {
          namespace: "custom"
          key: "product_descrption_two_content"
        }
      ]
    ) {
      key
      value
      reference {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query ProductRecommendedProducts(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
          width
          height
        }
          selectedOrFirstAvailableVariant {
            id
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
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
