"use client";

import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiCall } from "@/utils/api";

// Define Product type locally to avoid import issues
type Product = {
    _id: string;
    title: string;
    price: string;
    image: string;
};

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiCall("/api/products");
        const data = await res.json();
        setFeaturedProducts(data.slice(0, 8)); // Limit to first 8 items for "Featured"
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Hero animations
    const tl = gsap.timeline();
    
    // Animate content elements
    const heroBadge = contentRef.current?.querySelector('.hero-badge');
    const heroTitle = contentRef.current?.querySelector('.hero-title');
    const heroDescription = contentRef.current?.querySelector('.hero-description');
    const heroButtons = contentRef.current?.querySelector('.hero-buttons');
    const heroDots = contentRef.current?.querySelector('.hero-dots');

    if (heroBadge) {
      tl.fromTo(heroBadge, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }
    
    if (heroTitle) {
      tl.fromTo(heroTitle, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4"
      );
    }
    
    if (heroDescription) {
      tl.fromTo(heroDescription, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4"
      );
    }
    
    if (heroButtons) {
      tl.fromTo(heroButtons, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4"
      );
    }
    
    if (heroDots) {
      tl.fromTo(heroDots, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1 }, "-=0.2"
      );
    }

    // Floating elements animation
    if (floatingElementsRef.current) {
      const floatingElements = floatingElementsRef.current.children;
      gsap.to(floatingElements, {
        y: -20,
        duration: 2,
        ease: "power1.inOut",
        stagger: 0.2,
        repeat: -1,
        yoyo: true
      });
    }

    // Products section animation
    if (productsRef.current) {
      const productsTitle = productsRef.current.querySelector('.products-title');
      const productCards = productsRef.current.querySelectorAll('.product-card');
      
      if (productsTitle) {
        gsap.fromTo(productsTitle,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: productsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      if (productCards.length > 0) {
        gsap.fromTo(productCards,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: productsRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }

    return () => {
      // Cleanup ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [featuredProducts]);


  return (
    <>
      <section ref={heroRef} className="relative w-full h-[700px] overflow-hidden">
        {/* Background Image with Color Overlay */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero-pix1.jpg"
            alt="Furniture Background"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Colorful Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/30 to-pink-600/40"></div>
        </div>

        {/* Animated Colorful Elements */}
        <div ref={floatingElementsRef} className="absolute inset-0 z-5">
          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-20 w-24 h-24 border-2 border-cyan-300 rounded-full opacity-30"></div>
          <div className="absolute top-40 right-32 w-16 h-16 border-2 border-yellow-300 transform rotate-45 opacity-40"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-2 border-green-300 rounded-full opacity-30"></div>
          <div className="absolute bottom-20 right-1/4 w-12 h-12 border-2 border-orange-300 transform rotate-12 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-pink-300 rounded-full opacity-20"></div>
          
          {/* Glowing Dots */}
          <div className="absolute top-1/3 left-1/6 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/60"></div>
          <div className="absolute top-1/2 right-1/5 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/60"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/60"></div>
          <div className="absolute bottom-1/2 right-1/6 w-3 h-3 bg-orange-400 rounded-full shadow-lg shadow-orange-400/60"></div>
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-pink-400 rounded-full shadow-lg shadow-pink-400/60"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full">
          <div className="max-w-screen mx-auto px-6 lg:px-20 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-full">
            {/* Left Text Content */}
            <div ref={contentRef} className="bg-white/20 backdrop-blur-md p-10 rounded-lg shadow-2xl border border-white/30 max-w-lg">
              <div className="mb-4">
                <span className="hero-badge inline-block px-3 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs uppercase font-bold rounded-full">
                  New Arrival
                </span>
              </div>
              
              <h1 className="hero-title text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                Discover Our <br />
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                  New Collection
                </span>
              </h1>

              <p className="hero-description text-white/90 mb-8 text-base md:text-lg leading-relaxed drop-shadow-md">
                Transform your space with our handcrafted furniture collection. Each piece tells a story of quality, sustainability, and timeless design.
              </p>

              <div className="hero-buttons flex flex-col sm:flex-row gap-4">
                <a
                  href="/products"
                  className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                </a>
                <a
                  href="/about"
                  className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                </a>
              </div>

              {/* Animated Dots */}
              <div className="hero-dots mt-8 flex space-x-3">
                <div className="w-3 h-3 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
                <div className="w-3 h-3 bg-pink-300 rounded-full shadow-lg shadow-pink-300/50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="bg-white py-20 px-6 lg:px-20">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="products-title text-3xl font-bold text-gray-900 mb-10 text-center">
            Featured Products
          </h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>

  );
}
