import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import {Link} from 'react-router';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function RelatedProducts({products}) {
  const {open} = useAside();

  return (
    <section className="related-products section_heading">
      <h2>Related Products</h2>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{clickable: true}}
        spaceBetween={20}
        slidesPerView={5}
        breakpoints={{
          320: {slidesPerView: 1},
          640: {slidesPerView: 2},
          768: {slidesPerView: 3},
          1024: {slidesPerView: 4},
        }}
      >
        {products.map((product) => {
          const variantId =
            product.selectedOrFirstAvailableVariant?.id;

          return (
            <SwiperSlide key={product.id}>
              <div className="related-product-card product-item">
                <Link to={`/products/${product.handle}`}>
                  <Image
                    data={product.featuredImage}
                    aspectRatio="1/1"
                    sizes="250px"
                  />

                  <h4>{product.title}</h4>

                  <Money data={product.priceRange.minVariantPrice} />
                </Link>

                {variantId && (
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesAdd}
                    inputs={{
                      lines: [
                        {
                          merchandiseId: variantId,
                          quantity: 1,
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
                        {fetcher.state === 'submitting'
                          ? 'Adding...'
                          : 'Add to Cart'}
                      </button>
                    )}
                  </CartForm>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}