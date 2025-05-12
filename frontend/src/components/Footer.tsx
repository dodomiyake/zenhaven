"use client";

export default function Footer() {
    return (
        <footer className="bg-black text-gray-300 px-6 lg:px-20 py-16">
            <div className="max-w-screen-xl mx-auto grid md:grid-cols-5 gap-12">
                {/* Brand & Newsletter */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-white text-xl font-bold mb-2">ZenHaven</h2>
                        <p className="text-sm">
                            ZenHaven was created to bring calm and balance through elegant, mindful products — from wellness to
                            style.
                        </p>
                    </div>

                    <div className="bg-neutral-900 p-4 rounded">
                        <p className="font-semibold text-white mb-1">Don’t Wanna Miss Our Offers?</p>
                        <p className="text-sm text-gray-400 mb-3">Drop your email below and get the latest updates from ZenHaven
                        </p>
                        <form className="flex items-center space-x-2">
                            <input type="email" placeholder="Your email"
                                className="w-full px-3 py-2 rounded bg-gray-700 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" />
                            <button type="submit"
                                className="bg-white text-black text-sm font-semibold px-4 py-2 rounded hover:bg-gray-200">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-white font-semibold mb-3">Products</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Shoes</a></li>
                        <li><a href="#" className="hover:text-white">Apparel</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-3">Collections</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Nike</a></li>
                        <li><a href="#" className="hover:text-white">Adidas</a></li>
                        <li><a href="#" className="hover:text-white">Vans</a></li>
                        <li><a href="#" className="hover:text-white">Zen Brand</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-semibold mb-3">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="hover:text-white">Contact Us</a></li>
                        <li><a href="#" className="hover:text-white">Help Center</a></li>
                        <li><a href="#" className="hover:text-white">Terms</a></li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <span>© {new Date().getFullYear()} ZenHaven. All rights reserved.</span>
                <div className="space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms & Conditions</a>
                </div>
            </div>

        </footer>
    );
}