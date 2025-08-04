"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string;
  title: string;
  price: string;
  image: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </main>
  );
}



// import Image from "next/image";

// type Product = {
//     _id: string;
//     title: string;
//     price: string;
//     image: string;
// };

// async function getProducts(): Promise<Product[]> {
//     const res = await fetch("http://localhost:3000/api/products", {
//         cache: "no-store",
//     });
//     return res.json();
// }

// export default async function ProductsPage() {
//     const products = await getProducts();

//     return (
//         <section className="py-16 px-6 lg:px-20">
//             <h2 className="text-3xl font-bold text-center mb-10">Featured Products</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//                 {products.map((product) => (
//                     <div key={product._id} className="bg-white rounded-lg shadow p-4">
//                         <Image
//                             src={product.image}
//                             alt={product.title}
//                             width={300}
//                             height={300}
//                             className="w-full h-60 object-cover rounded"
//                         />
//                         <h3 className="text-lg font-semibold mt-4">{product.title}</h3>
//                         <p className="text-gray-700 mb-2">{product.price}</p>
//                         <button className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition">
//                             Add to Cart
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </section>
//     );
// }
