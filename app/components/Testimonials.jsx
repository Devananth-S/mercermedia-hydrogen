import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';


const testimonials = [
    {
        id: 1,
        name: 'John Smith',
        role: 'CEO, Mercer Inc.',
        image: 'https://i.pravatar.cc/150?img=12',
        review:
            'Excellent quality and outstanding customer service. Highly recommended!',
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        role: 'Marketing Manager',
        image: 'https://i.pravatar.cc/150?img=32',
        review:
            'Amazing products with super fast delivery. Will definitely shop again.',
    },
    {
        id: 3,
        name: 'David Brown',
        role: 'Business Owner',
        image: 'https://i.pravatar.cc/150?img=18',
        review:
            'The overall experience was fantastic. Great support team and premium quality.',
    },
];

export default function Testimonials() {
    return (
        <section className="testimonial-section section_heading">
            <div className="container">
                <h2>What Our Clients Say</h2>
                <div className="testimonial-slider">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                >
                    {testimonials.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div className="testimonial-card">

                                <div className="testimonial-image">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="testimonial-content">

                                    <div className="stars">★★★★★</div>

                                    <p className="review">
                                        {item.review}
                                    </p>

                                    <h3 className="author">{item.name}</h3>

                                    <p className="role">{item.role}</p>

                                </div>

                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                </div>
            </div>
        </section>
    );
}