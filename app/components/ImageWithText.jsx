import {Link} from 'react-router';

export function ImageWithText({
  image,
  heading,
  description,
  buttonText,
  buttonLink,
  reverse = false,
}) {
  return (
    <section id="image-with-text"
      className={`flex flex-col ${
        reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } items-center gap-10 py-16 px-6`}
    >
      <div className="lg:w-1/2 img_size">
        <img
          src={image}
          alt={heading}
          className=" w-full h-[500px] object-cover object-top rounded-2xl"
        />
      </div>

      <div className="lg:w-1/2">
        <h2 className="text-6xl font-bold mb-4">{heading}</h2>

        <p className="text-gray-600 mb-6">
          {description}
        </p>

        <Link
          to={buttonLink}
          className="inline-block bg-black text-white px-6 py-3 rounded-lg"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}