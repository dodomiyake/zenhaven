import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load .env.local

const MONGODB_URI = process.env.MONGODB_URI as string;

const productSchema = new mongoose.Schema(
    {
        title: String,
        price: String,
        image: String,
    },
    { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear old data
        await Product.deleteMany({});
        console.log("🧹 Old products removed");

        // Insert sample data
        const sampleProducts = [
            {
                title: "Smart Watch",
                price: "$199.00",
                image: "/products/watch.jpg",
            },
            {
                title: "Modern Chair",
                price: "$249.00",
                image: "/products/chair.jpg",
            },
            {
                title: "Bluetooth Speaker",
                price: "$99.00",
                image: "/products/speaker.jpg",
            },
            {
                title: "Aroma Diffuser",
                price: "$39.00",
                image: "/products/diffuser.jpg",
            },
        ];

        await Product.insertMany(sampleProducts);
        console.log("✅ Sample products inserted");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
//