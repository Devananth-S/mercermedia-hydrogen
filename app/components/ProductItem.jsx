import { Link } from 'react-router';
import { useState } from 'react';
import { useAside } from '~/components/Aside';
import { Image, Money, CartForm } from '@shopify/hydrogen';
import { useVariantUrl } from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({ product, loading }) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const variantId = product.selectedOrFirstAvailableVariant?.id;
  const [quantity, setQuantity] = useState(1);
  const { open } = useAside();

  return (
    <div className="product-item">

      <Link
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}

        <h4 className="product-title">{product.title}</h4>

        <small>
          <Money className="product-price" data={product.priceRange.minVariantPrice} />
        </small>
      </Link>

      <div className="product-card-actions">

        <div className="quantity-box">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{
            lines: [
              {
                merchandiseId: variantId,
                quantity,
              },
            ],
          }}
        >
          {(fetcher) => (
            <button
              type="submit"
              disabled={fetcher.state !== 'idle'}
              onClick={() => {
                setTimeout(() => open('cart'), 200);
              }}
            >
              {fetcher.state === 'submitting' ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </CartForm>

      </div>

    </div>
  );
}
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
