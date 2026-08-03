import './FeaturedProducts.css';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

export function FeaturedProducts({collection}) {
  if (!collection) return null;

  return (
    <section className="featured-products">
      <h2>{collection.title}</h2>

      <div className="featured-grid">
        {collection.products.nodes.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.handle}`}
            className="featured-card"
          >
            <Image
              data={product.featuredImage}
              aspectRatio="1/1"
              sizes="300px"
            />

            <h3>{product.title}</h3>

            <Money data={product.priceRange.minVariantPrice} />
          </Link>
        ))}
      </div>
    </section>
  );
}