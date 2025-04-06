import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Search, Plus, ChevronRight, Settings, BarChart } from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products");
        const querySnapshot = await getDocs(productsCollectionRef);

        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/edit/${productId}`);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") return a.name?.localeCompare(b.name);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "stock") return a.stock - b.stock;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-blue-400 font-medium">
            Loading inventory data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900 border border-red-700 rounded-lg m-4 text-white">
        <p className="text-xl font-bold">{error}</p>
        <p className="text-sm opacity-80 mt-2">
          Check your Firestore connection and permissions
        </p>
        <button
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Product Inventory
            </h1>
            <p className="text-gray-400 mt-1">Manage your product catalog</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/analytics")}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
            >
              <BarChart size={20} className="text-blue-400" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
            >
              <Settings size={20} className="text-blue-400" />
            </button>
            <button
              onClick={() => navigate("/add-product")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search and filter */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 flex items-center">
          <div className="relative flex-grow">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-4">
            <select
              className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="h-40 bg-gray-700 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <span className="font-mono text-blue-400">
                      ${product.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          product.stock > 10
                            ? "bg-green-500"
                            : product.stock > 0
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-400">
                        {product.stock} in stock
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:text-blue-400 transition-all group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-12 text-center bg-gray-800 rounded-xl">
              <div className="text-xl text-gray-400">No products found</div>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or add new products
              </p>
              <button
                onClick={() => navigate("/add-product")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>

        {/* Footer stats */}
      </div>
    </div>
  );
};

export default ProductList;
