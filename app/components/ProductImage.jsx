import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function ProductImage({image, images}) {
    const [selectedImage, setSelectedImage] = useState(image);
    useEffect(() => {
    setSelectedImage(image);
    }, [image]);

  if (!image) {
    return <div className="product-image" />;
  }
return (
  <div className="product-image">
    <Image
      alt={selectedImage?.altText || 'Product Image'}
      aspectRatio="1/1"
      data={selectedImage}
      key={selectedImage?.id}
      sizes="(min-width: 768px) 50vw, 100vw"
    />

    <div className="product-thumbnails">
      {images?.map((img) => (
        <div
          key={img.id}
            className={`thumbnail ${
    selectedImage?.id === img.id ? 'active' : ''
  }`}
          onClick={() => setSelectedImage(img)}
        >
          <Image
            data={img}
            alt={img.altText || 'Thumbnail'}
            aspectRatio="1/1"
            sizes="100px"
          />
        </div>
      ))}
    </div>
  </div>
);
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
