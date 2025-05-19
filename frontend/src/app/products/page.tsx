// src/app/products/page.tsx
import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Featured Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
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
