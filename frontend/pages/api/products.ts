import { connectToDatabase } from "../../lib/db";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

// Define product schema
const ProductSchema = new mongoose.Schema(
  {
    title: String,
    price: String,
    image: String,
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method === "GET") {
    const products = await Product.find({});
    return res.status(200).json(products);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
