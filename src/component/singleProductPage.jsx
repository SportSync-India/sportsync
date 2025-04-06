import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const SingleProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  // Seller address information
  const sellerAddress = "Yougiraj Colony Golkhede Road Shegaon 444203";
  const sellerName = "SportsFit Store";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "orders", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          setProduct(productSnap.data());
        } else {
          console.log("Order not found!");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleAccept = async () => {
    try {
      const productRef = doc(db, "orders", productId);
      await updateDoc(productRef, { status: "Accepted" });
      setProduct((prev) => ({ ...prev, status: "Accepted" }));
      alert("Order Accepted!");
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleRejectClick = () => {
    setShowReasonInput(true);
  };

  const handleRejectConfirm = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    try {
      const productRef = doc(db, "orders", productId);
      await updateDoc(productRef, {
        status: "Rejected",
        rejectionReason: reason,
      });
      setProduct((prev) => ({
        ...prev,
        status: "Rejected",
        rejectionReason: reason,
      }));
      alert("Order Rejected!");
      setShowReasonInput(false);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const calculateSubtotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      statusStyles[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-600 font-medium">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600">
            The order you're looking for doesn't exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const orderDate = product.orderDate?.toDate().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTotalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.totalPrice);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header with status */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Order Details</h1>
                <p className="text-blue-100 mt-2">
                  Transaction ID: {product.transactionId || productId}
                </p>
                <p className="text-blue-100">Order Date: {orderDate}</p>
              </div>
              <div>
                <span className={getStatusBadge(product.status)}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Shipping Information Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Customer Information
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Full Name</span>
                    <p className="font-medium">{product.fullName}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Phone Number</span>
                    <p className="font-medium">{product.phone}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">
                      Shipping Address
                    </span>
                    <p className="font-medium">{product.address}</p>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <svg
                    className="w-5 h-5 text-indigo-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Seller Information
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Store Name</span>
                    <p className="font-medium">{sellerName}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Address</span>
                    <p className="font-medium">{sellerAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Order Items
              </h3>

              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Qty
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {item.id.substring(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.size !== "-1" ? item.size : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ₹{item.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{calculateSubtotal(product.items).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>

                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-800">
                      Total
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formattedTotalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Actions */}
            <div className="space-y-4">
              {product.status === "Rejected" && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <svg
                      className="w-6 h-6 text-red-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">Order Rejected</p>
                      <p className="text-red-700 mt-1">
                        {product.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {product.status !== "Accepted" &&
                product.status !== "Rejected" && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg flex-1 flex items-center justify-center font-medium shadow-md hover:shadow-lg transform transition hover:-translate-y-1"
                      onClick={handleAccept}
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Accept Order
                    </button>

                    {!showReasonInput && (
                      <button
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-lg flex-1 flex items-center justify-center font-medium shadow-md hover:shadow-lg transform transition hover:-translate-y-1"
                        onClick={handleRejectClick}
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Reject Order
                      </button>
                    )}
                  </div>
                )}

              {showReasonInput && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    placeholder="Please explain why you're rejecting this order..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setShowReasonInput(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleRejectConfirm}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
