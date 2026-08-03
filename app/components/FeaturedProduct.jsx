import { useState } from 'react';
import { Link } from 'react-router';
import { CartForm, Image, Money } from '@shopify/hydrogen';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';


export function FeaturedProduct({ product }) {
    if (!product) return null;
    const [quantity, setQuantity] = useState(1);

    const variant = product.selectedOrFirstAvailableVariant;

    const images =
        product.images?.nodes?.length > 0
            ? product.images.nodes
            : [product.featuredImage];

    return (
        <section className="my-20 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <div className="w-full min-w-0">
                    <Swiper
    modules={[Navigation, Pagination]}
    slidesPerView={1}
    navigation
    pagination={{
        clickable: true,
        dynamicBullets: true,
    }}
    className="featured-swiper"
>
                        {images.map((image) => (
                            <SwiperSlide key={image.id}>
                                <Image
                                    data={image}
                                    sizes="(min-width:1024px) 50vw,100vw"
                                    className="w-full aspect-[4/5] object-cover rounded-2xl"
                                    />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div>
                    <p className="text-sm uppercase text-gray-500 mb-2">
                        Featured Product
                    </p>

                    <h2 className="text-4xl font-bold mb-4">
                        {product.title}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {product.description}
                    </p>

                    <div className="text-2xl font-bold mb-6">
                        <Money data={variant.price} />

                        {variant.compareAtPrice && (
                            <p className="text-gray-400 line-through text-lg mt-2">
                                <Money data={variant.compareAtPrice} />
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-5 mt-8 mb-8">

                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="border w-10 h-10 rounded"
                        >
                            -
                        </button>

                        <span className="font-bold text-xl">
                            {quantity}
                        </span>

                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="border w-10 h-10 rounded"
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
                                    merchandiseId: variant.id,
                                    quantity,
                                },
                            ],
                        }}
                    >
                        {(fetcher) => (
                            <button
                                disabled={fetcher.state !== 'idle'}
                                className="w-full bg-black text-white py-4 rounded-lg"
                            >
                                {fetcher.state === 'idle'
                                    ? 'Add To Cart'
                                    : 'Adding...'}
                            </button>
                        )}
                    </CartForm>

                    <Link
                        to={`/products/${product.handle}`}
                        className="block mt-4 border text-center py-4 rounded-lg"
                    >
                        View Product
                    </Link>
                </div>
            </div>
        </section>
    );
}