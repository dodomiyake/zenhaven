"use client";

import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";

export default function Home() {

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setFeaturedProducts(data.slice(0, 8)); // Limit to first 8 items for "Featured"
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      }
    };

    fetchProducts();
  }, []);


  return (
    <>
      <section className="relative w-full h-[700px] bg-[#f4f1eb] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero-pix1.jpg"
            alt="Furniture Background"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full">
          <div className="max-w-screen mx-auto px-6 lg:px-20 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full">
            {/* Left Text Content */}
            <div className="bg-[#e4dfd7]/60 p-10 rounded-md shadow max-w-lg">
              <p className="text-sm uppercase text-gray-500 mb-2">New Arrival</p>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                Discover Our <br /> New Collection
              </h1>

              <p className="text-gray-600 mb-6 text-base md:text-lg leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
              </p>

              <a
                href="/products"
                className="inline-block bg-black text-white px-6 py-3 rounded-sm font-medium hover:bg-gray-800 transition text-sm md:text-base"
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white py-20 px-6 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Featured Products
          </h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>

  );
}
