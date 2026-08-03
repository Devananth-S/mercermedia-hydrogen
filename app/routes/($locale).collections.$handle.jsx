import {
  redirect,
  useLoaderData,
  useSearchParams,
  useNavigate,
} from 'react-router';
import { getPaginationVariables, Analytics } from '@shopify/hydrogen';
import { PaginatedResourceSection } from '~/components/PaginatedResourceSection';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { ProductItem } from '~/components/ProductItem';
import {useState} from 'react';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  return [{ title: `Hydrogen | ${data?.collection.title ?? ''} Collection` }];
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
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const url = new URL(request.url);
  const filters = url.searchParams
    .getAll('filter')
    .map((item) => JSON.parse(item));
  console.log(JSON.stringify(filters, null, 2));

  const sort = url.searchParams.get('sort') || 'manual';

  let sortKey = 'COLLECTION_DEFAULT';
  let reverse = false;

  switch (sort) {
    case 'best-selling':
      sortKey = 'BEST_SELLING';
      break;

    case 'price-ascending':
      sortKey = 'PRICE';
      reverse = false;
      break;

    case 'price-descending':
      sortKey = 'PRICE';
      reverse = true;
      break;

    case 'title-ascending':
      sortKey = 'TITLE';
      reverse = false;
      break;

    case 'title-descending':
      sortKey = 'TITLE';
      reverse = true;
      break;

    case 'created-descending':
      sortKey = 'CREATED';
      reverse = true;
      break;

    case 'created-ascending':
      sortKey = 'CREATED';
      reverse = false;
      break;

    default:
      sortKey = 'COLLECTION_DEFAULT';
  }

  if (!handle) {
    throw redirect('/collections');
  }
  const [{ collection }] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        filters,
        sortKey,
        reverse,
      },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  console.log(
    collection.handle,
    collection.products.totalCount,
    collection.products.nodes.length,
  );

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, { handle, data: collection });

  return {
    collection,
  };
}

/**
* Load data for rendering content below the fold. This data is deferred and will be
* fetched after the initial page load. If it's unavailable, the page should still 200.
* Make sure to not throw any errors here, as it will cause the page to 500.
* @param {Route.LoaderArgs}
*/
function loadDeferredData({ context }) {
  return {};
}

export default function Collection() {

  /** @type {LoaderReturnData} */
  const [showFilters, setShowFilters] = useState(false);
  const { collection } = useLoaderData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filters = collection.products.filters;
  function handleFilterChange(input, checked) {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.append('filter', input);
    } else {
      const filters = params.getAll('filter').filter((item) => item !== input);
      params.delete('filter');
      filters.forEach((item) => params.append('filter', item));
    }
    navigate(`?${params.toString()}`);
  }
  function handleSortChange(event) {
    const params = new URLSearchParams(searchParams);

    params.set('sort', event.target.value);

    navigate(`?${params.toString()}`);
  }
  function handleClearAll() {
    console.log("Clear All Clicked");
    window.location.href = `/collections/${collection.handle}`;
  }

  return (
    <div className="collection">
      <div className="collection_banner">
        <div className="collection-banner">
          <img
            src={collection.image?.url}
            alt={collection.image?.altText || collection.title}
          />

          <div className="collection-banner-content">
            <h1>{collection.title}</h1>
            <p>{collection.description}</p>
          </div>
        </div>
      </div>

      <div className="collection-content">
      <div className="mobile-filter-bar">
          <button
            className="filter-btn"
            onClick={() => setShowFilters(true)}
          >
            Filters
          </button>
        </div>
        {showFilters && (
            <div
              className="filter-backdrop"
              onClick={() => setShowFilters(false)}
            />
          )}
        <aside
          className={`collection-sidebar ${showFilters ? 'active' : ''}`}
        >
          <button
            className="close-filter"
            onClick={() => setShowFilters(false)}
          >
            ✕
          </button>

          <div className="collection-sidebar-title">
            <h3>Filters</h3>

            <button
              type="button"
              className="clear-all-btn"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="filter-body">
            {filters.map((filter) => (
              <div key={filter.id} className="filter-accordion-container">
                <details className="filter-accordion">
                  <summary>{filter.label}</summary>

                  {filter.values.map((value) => (
                    <label key={value.id}>
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          handleFilterChange(value.input, e.target.checked)
                        }
                      />
                      {value.label} ({value.count})
                    </label>
                  ))}
                </details>
              </div>
            ))}
          </div>

          {/* Fixed Footer */}
          <div className="filter-footer">
            <button
              className="apply-filter-btn"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </button>
          </div>
        </aside>

        <div className="collection-products">
          <div className="collection-filter">
            <label htmlFor="collection-sort">Sort By</label>

            <select
              id="collection-sort"
              value={searchParams.get('sort') || 'manual'}
              onChange={handleSortChange}
            >
              <option value="manual">Featured</option>
              <option value="best-selling">Best Selling</option>
              <option value="price-ascending">Price: Low to High</option>
              <option value="price-descending">Price: High to Low</option>
              <option value="title-ascending">A - Z</option>
              <option value="title-descending">Z - A</option>
              <option value="created-descending">Newest</option>
              <option value="created-ascending">Oldest</option>
            </select>
          </div>

          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="products-grid"
          >
            {({ node: product, index }) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </div>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
fragment MoneyProductItem on MoneyV2 {
  amount
  currencyCode
}

fragment ProductItem on Product {
  id
  handle
  title

  featuredImage {
    id
    altText
    url
    width
    height
  }

  selectedOrFirstAvailableVariant {
    id
  }

  variants(first: 20) {
    nodes {
      id
      selectedOptions {
        name
        value
      }
    }
  }

  priceRange {
    minVariantPrice {
      ...MoneyProductItem
    }

    maxVariantPrice {
      ...MoneyProductItem
    }
  }
}
`;

const COLLECTION_QUERY = `#graphql
${PRODUCT_ITEM_FRAGMENT}

query Collection(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
  $first: Int
  $last: Int
  $startCursor: String
  $endCursor: String
  $filters: [ProductFilter!]
  $sortKey: ProductCollectionSortKeys
  $reverse: Boolean
) @inContext(country: $country, language: $language) {

  collection(handle: $handle) {
    id
    handle
    title
    description

    image {
      url
      altText
    }

    products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {

      filters {
        id
        label
        type

        values {
          id
          label
          count
          input
        }
      }

      nodes {
        ...ProductItem
      }

      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
    }
  }
}
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
