import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router';
import { Image } from '@shopify/hydrogen';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function BlogSlider({ blogs }) {
  if (!blogs?.blog?.articles?.nodes?.length) return null;

  return (
    <section className="blog-slider section_heading">
      <div className="blog-slider-header">
        <h2>Latest Articles</h2>
        <div className="blog-slider-footer">
          <Link
            to="/blogs/mercer-media"
            className="view-all-blogs-btn"
          >
            View All Blog Posts
          </Link>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {blogs.blog.articles.nodes.map((article) => (
          <SwiperSlide key={article.id}>
            <div className="blog-article">
              <Link
                to={`/blogs/${blogs.blog.handle}/${article.handle}`}
                className="blog-card"
              >
                <Image
                  data={article.image}
                  aspectRatio="16/9"
                  sizes="400px"
                />

                <div className="blog-card-content">
                  <h3>{article.title}</h3>

                  <p>{article.excerpt}</p>

                  <span className="read-more">
                    Read More →
                  </span>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>


    </section>
  );
}