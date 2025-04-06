import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Edit,
  Trash2,
  Save,
  X,
  ArrowLeft,
  Tag,
  Package,
  IndianRupee,
  Layers,
  FileText,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

const EditDeleteProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    imageUrl: "",
    sizes: [],
  });
  const API_URL = "http://10.254.201.27:5000";
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          setProduct(productData);
          setFormData({
            name: productData.name || "",
            price: productData.price || "",
            stock: productData.stock || "",
            category: productData.category || "",
            description: productData.description || "",
            imageUrl: productData.imageUrl || "",
            sizes: productData.sizes || [],
          });
        } else {
          setMessage({ text: "Product not found.", type: "error" });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setMessage({ text: "Failed to load product.", type: "error" });
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (field) => {
    setMessage({ text: "", type: "" });
    try {
      const productRef = doc(db, "products", productId);

      // Special handling for image uploads
      if (field === "imageUrl" && fileInputRef.current?.files?.length > 0) {
        await handleImageUpload();
        return;
      }

      // Prepare the update data with the correct data type
      const updateData = {};
      if (field === "price") {
        updateData[field] = parseFloat(formData[field]);
      } else if (field === "stock") {
        updateData[field] = parseInt(formData[field], 10);
      } else {
        updateData[field] = formData[field];
      }

      await updateDoc(productRef, updateData);
      setMessage({ text: `${field} updated successfully!`, type: "success" });
      setActiveField(null);

      // Update the local product state
      setProduct({ ...product, ...updateData });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      setMessage({ text: `Failed to update ${field}.`, type: "error" });
    }
  };

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      setMessage({ text: "Please select an image first.", type: "error" });
      return;
    }

    const file = fileInputRef.current.files[0];
    setUploading(true);
    setMessage({ text: "Uploading image...", type: "info" });

    try {
      // Create form data
      const formDataToSend = new FormData();
      formDataToSend.append("image", file);

      // Add any other fields needed for the update
      if (formData.name) formDataToSend.append("name", formData.name);
      if (formData.price) formDataToSend.append("price", formData.price);
      if (formData.stock) formDataToSend.append("stock", formData.stock);
      if (formData.category)
        formDataToSend.append("category", formData.category);
      if (formData.description)
        formDataToSend.append("description", formData.description);
      if (formData.sizes.length)
        formDataToSend.append("sizes", formData.sizes.join(","));

      // Send to server
      const response = await fetch(`${API_URL}/update/${productId}`, {
        method: "PUT",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setFormData({
          ...formData,
          imageUrl: result.imageUrl,
        });

        setProduct({
          ...product,
          imageUrl: result.imageUrl,
        });

        setMessage({ text: "Image updated successfully!", type: "success" });
        setActiveField(null);
        setImagePreview(null);
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ text: "Failed to upload image.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      setMessage({ text: "Product deleted successfully!", type: "success" });
      setTimeout(() => navigate("/products"), 1500);
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ text: "Failed to delete product.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-r shadow-md">
          <p className="font-bold text-lg mb-2">Product Not Found</p>
          <p>This product may have been deleted or moved.</p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8">
      {/* Message display */}
      {message.text && (
        <div
          className={`p-4 flex items-center ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-l-4 border-green-500"
              : message.type === "error"
              ? "bg-red-50 text-red-700 border-l-4 border-red-500"
              : "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
          }`}
        >
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 border-b flex justify-between items-center text-white">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/products")}
            className="mr-4 text-white/80 hover:text-white transition-colors"
            aria-label="Back to products"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-bold">
            {editMode ? "Edit Product" : "Product Details"}
          </h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              editMode
                ? "bg-white/20 hover:bg-white/30"
                : "bg-white text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <Edit size={18} className="mr-2" />
            {editMode ? "View Details" : "Edit Product"}
          </button>
          <button
            onClick={handleDeleteProduct}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Trash2 size={18} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <Tag size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Product Name</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(activeField === "name" ? null : "name")
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "name" ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 flex-grow rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleSave("name")}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setActiveField(null)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-800">
                  {product.name}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <IndianRupee size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Price</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(activeField === "price" ? null : "price")
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "price" ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 flex-grow rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleSave("price")}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setActiveField(null)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <p className="text-xl font-semibold text-indigo-600">
                  ₹{product.price}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <Package size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Stock</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(activeField === "stock" ? null : "stock")
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "stock" ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 flex-grow rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleSave("stock")}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setActiveField(null)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <p className="text-xl font-semibold text-gray-800">
                    {product.stock}
                  </p>
                  <span className="ml-2 text-gray-500">units</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <Layers size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Category</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(
                      activeField === "category" ? null : "category"
                    )
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "category" ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 flex-grow rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => handleSave("category")}
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setActiveField(null)}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <p className="text-xl font-semibold text-gray-800">
                  {product.category}
                </p>
              )}
            </div>

            {/* Description - Full width */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <FileText size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Description</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(
                      activeField === "description" ? null : "description"
                    )
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "description" ? (
                <div className="flex flex-col space-y-3">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    rows="4"
                  ></textarea>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave("description")}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                    >
                      <Save size={18} className="mr-2" /> Save
                    </button>
                    <button
                      onClick={() => setActiveField(null)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                    >
                      <X size={18} className="mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Image Upload - Full width */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-gray-700">
                  <ImageIcon size={18} className="mr-2 text-indigo-500" />
                  <h3 className="font-medium">Product Image</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveField(
                      activeField === "imageUrl" ? null : "imageUrl"
                    )
                  }
                  className="text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
              {activeField === "imageUrl" ? (
                <div className="flex flex-col space-y-4">
                  <div
                    className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center">
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  {/* Image Preview */}
                  {(imagePreview || product.imageUrl) && (
                    <div className="mt-4 border rounded-lg p-4 flex flex-col items-center bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">
                        Image Preview:
                      </p>
                      <img
                        src={imagePreview || product.imageUrl}
                        alt="Product preview"
                        className="h-48 w-auto object-contain"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave("imageUrl")}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        !fileInputRef.current?.files?.length || uploading
                      }
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-0 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" /> Upload & Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveField(null);
                        setImagePreview(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                      disabled={uploading}
                    >
                      <X size={18} className="mr-2" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src={
                      product.imageUrl ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    alt={product.name}
                    className="h-48 w-auto object-contain rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300?text=No+Image";
                    }}
                  />
                  <p className="text-gray-500 text-sm mt-2 truncate max-w-full">
                    {product.imageUrl
                      ? "Current image URL"
                      : "No image uploaded"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image */}
            <div className="lg:w-2/5">
              <div className="bg-gray-50 rounded-xl p-6 flex justify-center">
                <img
                  src={
                    product.imageUrl ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={product.name}
                  className="h-64 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300?text=No+Image";
                  }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-3/5">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg flex items-center">
                  <IndianRupee size={18} className="mr-2" />
                  <span className="font-semibold">₹{product.price}</span>
                </div>

                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center">
                  <Package size={18} className="mr-2" />
                  <span className="font-semibold">
                    {product.stock} in stock
                  </span>
                </div>

                <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg flex items-center">
                  <Layers size={18} className="mr-2" />
                  <span className="font-semibold">{product.category}</span>
                </div>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-medium"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {product.createdAt && (
                <div className="text-sm text-gray-500">
                  Added on: {product.createdAt.toDate().toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditDeleteProduct;
