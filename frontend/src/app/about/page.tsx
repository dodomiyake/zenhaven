"use client";

import Image from "next/image";
import { Leaf, Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] bg-[#f4f1eb] overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/hero-pix.jpg"
            alt="About ZenHaven"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 h-full w-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">About ZenHaven</h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto px-6">
              Crafting beautiful spaces with sustainable, handcrafted furniture
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded in 2020, ZenHaven began with a simple vision: to create furniture that not only enhances your living space but also respects our planet. What started as a small workshop has grown into a beloved destination for those who appreciate quality craftsmanship and sustainable design.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Our team of skilled artisans combines traditional woodworking techniques with modern design principles, creating pieces that are both timeless and contemporary. Every item in our collection is carefully crafted using responsibly sourced materials and eco-friendly practices.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe that beautiful furniture should be accessible to everyone, which is why we maintain fair pricing while never compromising on quality or our commitment to sustainability.
              </p>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/products/chair.jpg"
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 lg:px-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4 inline-block">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We use responsibly sourced materials and eco-friendly practices in everything we create.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4 inline-block">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality</h3>
              <p className="text-gray-600">
                Every piece is crafted with attention to detail and built to last for generations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4 inline-block">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                We support local artisans and build lasting relationships with our customers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-4 inline-block">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Passion</h3>
              <p className="text-gray-600">
                We're passionate about creating beautiful spaces that bring joy to your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                  SM
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Mitchell</h3>
              <p className="text-gray-600 mb-3">Founder & Creative Director</p>
              <p className="text-gray-500 text-sm">
                With over 15 years in furniture design, Sarah leads our creative vision and ensures every piece meets our high standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                  MJ
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Michael Johnson</h3>
              <p className="text-gray-600 mb-3">Head Craftsman</p>
              <p className="text-gray-500 text-sm">
                A master woodworker with 20+ years of experience, Michael oversees all production and maintains our quality standards.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
                  ED
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emma Davis</h3>
              <p className="text-gray-600 mb-3">Sustainability Manager</p>
              <p className="text-gray-500 text-sm">
                Emma ensures we maintain our commitment to environmental responsibility and sustainable sourcing practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 lg:px-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-gray-300">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <p className="text-gray-300">Pieces Crafted</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <p className="text-gray-300">Years of Excellence</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-gray-300">Sustainable Materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-20 bg-[#f4f1eb]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Discover our collection of handcrafted furniture and start creating the home of your dreams today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-block bg-black text-white px-8 py-4 rounded-sm font-medium hover:bg-gray-800 transition"
            >
              Shop Our Collection
            </a>
            <a
              href="/contact"
              className="inline-block border-2 border-black text-black px-8 py-4 rounded-sm font-medium hover:bg-black hover:text-white transition"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 