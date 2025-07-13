'use client';
import React, { useState } from 'react';
import ProductForm from './ProductForm';

interface Product {
  name: string;
  price: string;
  description: string;
  image: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
    setShowAddModal(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <button
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          onClick={() => setShowAddModal(true)}
        >
          Add Product
        </button>
      </div>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Image</th>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Price</th>
            <th className="py-3 px-4 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">No products yet.</td>
            </tr>
          ) : (
            products.map((product, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 px-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                </td>
                <td className="py-2 px-4 font-semibold">{product.name}</td>
                <td className="py-2 px-4">{product.price}</td>
                <td className="py-2 px-4 text-sm text-gray-600">{product.description}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showAddModal && (
        <ProductForm
          onSubmit={handleAddProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
} 