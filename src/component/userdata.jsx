import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });

          const userData = userDoc.data();
          if (userData.orders && userData.orders.length > 0) {
            const orderDetailsPromises = userData.orders.map(
              async (orderId) => {
                const orderDocRef = doc(db, "orders", orderId);
                const orderDoc = await getDoc(orderDocRef);
                if (orderDoc.exists()) {
                  return { id: orderDoc.id, ...orderDoc.data() };
                }
                return { id: orderId, status: "Unknown order" };
              }
            );

            const orderDetails = await Promise.all(orderDetailsPromises);
            setOrders(orderDetails);
          }
        } else {
          setError("User not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details: ", err);
        setError("Failed to load user details. Please try again later.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBackClick = () => {
    navigate("/users");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error}
      </div>
    );

  if (!user)
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700 text-center">
        User not found
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Users
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 text-white">
                <h2 className="text-xl font-bold">User Profile</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </div>

                <h1 className="text-xl font-bold text-center text-gray-800 mb-1">
                  {user.fullName}
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Member since {formatDate(user.createdAt)}
                </p>

                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-500">
                      User ID:
                    </span>
                    <span className="text-sm text-gray-800 overflow-hidden overflow-ellipsis max-w-xs">
                      {user.uid}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-gray-500">
                      Total Orders:
                    </span>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Contact Information
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </h3>
                    <p className="text-gray-800 break-words">{user.email}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-800">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Shipping Address
                  </h3>
                  <p className="text-gray-800">
                    {user.address || "No address on file"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order History Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order History
                </h2>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>

              <div className="p-6">
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-md">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-md">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order, index) => (
                          <tr
                            key={order.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.createdAt
                                ? formatDate(order.createdAt)
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  order.status === "Accepted"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status || "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.total
                                ? `$${order.total.toFixed(2)}`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-6 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-yellow-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      No Orders Found
                    </h3>
                    <p className="text-yellow-600">
                      This user hasn't placed any orders yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
