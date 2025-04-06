import React, { useState } from "react";
import { auth } from "../firebase"; // Ensure Firebase is configured
import { useAuthState } from "react-firebase-hooks/auth";

const AddProduct = () => {
  const [user] = useAuthState(auth);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    sizes: "",
    description: "",
    imageFile: null, // Store file for preview
    imageUrl: "", // URL after upload
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to add a product.");
      return;
    }
    if (!product.imageFile) {
      alert("Please select an image.");
      return;
    }

    setUploading(true);

    try {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("image", product.imageFile);
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("category", product.category);
      formData.append("stock", product.stock);
      formData.append("sizes", product.sizes);
      formData.append("description", product.description);
      formData.append("addedBy", user.uid);

      const response = await fetch("https://sportsync-server.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setProduct({
          name: "",
          price: "",
          category: "",
          stock: "",
          sizes: "",
          description: "",
          imageFile: null,
          imageUrl: data.imageUrl, // Store uploaded image URL
        });
        alert("Product added successfully!");
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Error uploading product.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-xl font-bold text-center mb-4">Add Product</h2>

          <input
            type="text"
            name="name"
            value={product.name}
            placeholder="Product Name"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <input
            type="number"
            name="price"
            value={product.price}
            placeholder="Price"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <input
            type="text"
            name="category"
            value={product.category}
            placeholder="Category"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <input
            type="number"
            name="stock"
            value={product.stock}
            placeholder="Stock Quantity"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <input
            type="text"
            name="sizes"
            value={product.sizes}
            placeholder="Sizes (comma-separated, e.g., 7, 8, 9)"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <textarea
            name="description"
            value={product.description}
            placeholder="Product Description"
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 w-full mb-2"
          />

          <label className="block font-medium mb-2">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border px-3 py-2 w-full mb-2"
          />
          {product.imageFile && (
            <img
              src={URL.createObjectURL(product.imageFile)}
              alt="Preview"
              className="mt-2 rounded-lg w-full h-40 object-cover"
            />
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-3"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      ) : (
        <p className="text-red-600 font-medium text-center">
          Please log in to add products.
        </p>
      )}
    </div>
  );
};

export default AddProduct;
