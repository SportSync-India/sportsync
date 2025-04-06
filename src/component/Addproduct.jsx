import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios"; // Import axios

const AddProduct = () => {
  const [user] = useAuthState(auth);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    sizes: "",
    description: "",
    imageFile: null,
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  // Predefined categories
  const categories = [
    "Footwear",
    "Apparel",
    "Accessories",
    "Equipment",
    "Electronics",
    "Training & Recovery",
    "Outdoor & Adventure",
    "Nutrition & Supplements",
  ];

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct((prev) => ({ ...prev, imageFile: file }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setProduct((prev) => ({ ...prev, imageFile: e.dataTransfer.files[0] }));
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
      // Create FormData object for the axios request
      const formData = new FormData();
      formData.append("image", product.imageFile);
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("category", product.category);
      formData.append("stock", product.stock);
      formData.append("sizes", product.sizes);
      formData.append("description", product.description);
      formData.append("addedBy", user.uid);

      // Using axios instead of fetch
      const response = await axios.post(
        "https://sportsync-server.onrender.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Axios automatically parses JSON response
      const data = response.data;

      if (data.success) {
        setProduct({
          name: "",
          price: "",
          category: "",
          stock: "",
          sizes: "",
          description: "",
          imageFile: null,
          imageUrl: data.imageUrl,
        });
        alert("Product added successfully!");
        setCurrentStep(1);
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      // More detailed error handling with axios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response error:", error.response.data);
        alert(`Error: ${error.response.data.message || "Server error"}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request error:", error.request);
        alert("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        alert(`Error: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => {
    if (
      currentStep === 1 &&
      (!product.name || !product.price || !product.category)
    ) {
      alert("Please fill all required fields before proceeding.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex justify-center items-center py-12 px-4">
      {user ? (
        <div className="max-w-4xl w-full">
          {/* Header with glowing effect */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white relative inline-block">
              <span className="relative z-10">Add New Product</span>
              <span className="absolute inset-0 bg-blue-500 opacity-20 blur-xl rounded-full"></span>
            </h1>
            <p className="text-blue-300 mt-2">
              Complete all steps to publish your product
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 h-1 w-full bg-gray-700 -translate-y-1/2"></div>

            {/* Step 1 */}
            <div
              className={`relative z-10 flex flex-col items-center ${
                currentStep >= 1 ? "text-blue-400" : "text-gray-500"
              }`}
              onClick={() => setCurrentStep(1)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 1
                    ? "border-blue-500 bg-blue-500 text-white"
                    : currentStep > 1
                    ? "border-blue-500 bg-blue-900 text-blue-300"
                    : "border-gray-700 bg-gray-800 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="mt-2 text-sm font-medium">Basic Info</span>
            </div>

            {/* Step 2 */}
            <div
              className={`relative z-10 flex flex-col items-center ${
                currentStep >= 2 ? "text-blue-400" : "text-gray-500"
              }`}
              onClick={() => currentStep >= 1 && setCurrentStep(2)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 2
                    ? "border-blue-500 bg-blue-500 text-white"
                    : currentStep > 2
                    ? "border-blue-500 bg-blue-900 text-blue-300"
                    : "border-gray-700 bg-gray-800 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="mt-2 text-sm font-medium">Details</span>
            </div>

            {/* Step 3 */}
            <div
              className={`relative z-10 flex flex-col items-center ${
                currentStep >= 3 ? "text-blue-400" : "text-gray-500"
              }`}
              onClick={() => currentStep >= 2 && setCurrentStep(3)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 3
                    ? "border-blue-500 bg-blue-500 text-white"
                    : currentStep > 3
                    ? "border-blue-500 bg-blue-900 text-blue-300"
                    : "border-gray-700 bg-gray-800 text-gray-500"
                }`}
              >
                3
              </div>
              <span className="mt-2 text-sm font-medium">Image</span>
            </div>
          </div>

          {/* Form container with glass morphism effect */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700 shadow-xl">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      1
                    </span>
                    Basic Information
                  </h2>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-blue-300 mb-2 font-medium">
                        Product Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white transition-colors duration-300 focus:outline-none"
                        placeholder="Enter product name..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-blue-300 mb-2 font-medium">
                          Price (₹)*
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-10 py-3 text-white transition-colors duration-300 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-blue-300 mb-2 font-medium">
                          Category*
                        </label>
                        <div className="relative">
                          <select
                            name="category"
                            value={product.category}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white transition-colors duration-300 focus:outline-none appearance-none"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg
                              className="fill-current h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-300"
                    >
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Additional Details */}
              {currentStep === 2 && (
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      2
                    </span>
                    Product Details
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-blue-300 mb-2 font-medium">
                          Stock Quantity*
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={product.stock}
                          onChange={handleChange}
                          required
                          min="0"
                          className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white transition-colors duration-300 focus:outline-none"
                          placeholder="Available quantity"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-blue-300 mb-2 font-medium">
                          Sizes*
                        </label>
                        <input
                          type="text"
                          name="sizes"
                          value={product.sizes}
                          onChange={handleChange}
                          required
                          className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white transition-colors duration-300 focus:outline-none"
                          placeholder="e.g., S, M, L, XL or 7, 8, 9"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-blue-300 mb-2 font-medium">
                        Description*
                      </label>
                      <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="w-full bg-gray-900 border-2 border-gray-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white transition-colors duration-300 focus:outline-none resize-none"
                        placeholder="Provide a detailed description of your product..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-300"
                    >
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Image */}
              {currentStep === 3 && (
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                      3
                    </span>
                    Product Image
                  </h2>

                  <div
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
                      dragActive
                        ? "border-blue-500 bg-blue-500 bg-opacity-10"
                        : "border-gray-600 hover:border-blue-400 hover:bg-blue-500 hover:bg-opacity-5"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    {product.imageFile ? (
                      <div className="space-y-4 w-full">
                        <img
                          src={URL.createObjectURL(product.imageFile)}
                          alt="Preview"
                          className="mx-auto rounded-lg max-h-64 object-contain"
                        />
                        <p className="text-center text-blue-300">
                          {product.imageFile.name} (
                          {Math.round(product.imageFile.size / 1024)} KB)
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProduct((prev) => ({
                              ...prev,
                              imageFile: null,
                            }));
                          }}
                          className="mx-auto block text-red-400 hover:text-red-300"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-500 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-lg font-medium text-gray-300 mb-2">
                          Drag & drop your product image here
                        </p>
                        <p className="text-gray-500 mb-4">
                          or click to browse files
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, WEBP. Max size: 5MB
                        </p>
                      </>
                    )}
                    <input
                      id="fileInput"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="mt-10 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !product.imageFile}
                      className={`flex items-center px-8 py-3 rounded-lg font-medium text-white ${
                        !product.imageFile
                          ? "bg-gray-600 cursor-not-allowed"
                          : uploading
                          ? "bg-blue-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } transition-colors duration-300`}
                    >
                      {uploading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          Publish Product
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Summary Panel */}
          <div className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-medium mb-4">Product Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium truncate">
                  {product.name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-white font-medium">
                  {product.price ? `₹${product.price}` : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Category</p>
                <p className="text-white font-medium">
                  {product.category || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Stock</p>
                <p className="text-white font-medium">
                  {product.stock || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-xl border border-red-500 max-w-md w-full text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-red-300 mb-6">
            You must be logged in to add products to the system.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
