import {Link} from 'react-router';

export default function Hero() {
  return (
      <section className="home_banner">
        <img
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=80"
          alt="Mercer Media Banner"
          loading="eager"
          fetchPriority="high"
        />

        <div className="home_banner_content">
          <div className="inner_content_hm">
            <h1>Mercer Media</h1>
            <h2>Modern Headless Shopify Store built with Hydrogen</h2>

            <Link to="/collections">Shop Now</Link>
          </div>
        </div>
      </section>
  );
}