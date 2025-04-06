import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollection = collection(db, "orders");
        const orderSnapshot = await getDocs(ordersCollection);
        const orderList = orderSnapshot.docs.map((doc) => {
          const data = doc.data();
          const items = data.items?.map((item) => ({
            ...item,
            status: data.status || "Pending",
          }));

          return {
            id: doc.id,
            ...data,
            status: data.status || "Pending", // Default to Pending if no status
            items: items || [],
          };
        });
        setOrders(orderList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on selected tab - case insensitive matching
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === activeTab.toLowerCase()
        );

  // Helper function to navigate to order details
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // Helper function to navigate to product page without propagation
  const handleProductClick = (e, productId) => {
    e.stopPropagation(); // Prevent triggering the parent card's onClick
    navigate(`/product/${productId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500">Track and manage your orders</p>
        </div>

        {/* Tab navigation - sports style */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ALL ORDERS
            </button>
            <button
              onClick={() => setActiveTab("Pending")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "Pending"
                  ? "bg-yellow-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              PENDING
            </button>
            <button
              onClick={() => setActiveTab("Accepted")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "Accepted"
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              ACCEPTED
            </button>
            <button
              onClick={() => setActiveTab("Rejected")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                activeTab === "Rejected"
                  ? "bg-red-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              REJECTED
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No {activeTab !== "all" ? activeTab : ""} orders found
            </h3>
            <p className="text-gray-500">
              {activeTab === "all"
                ? "You haven't placed any orders yet"
                : `You don't have any ${activeTab.toLowerCase()} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:transform hover:scale-101 cursor-pointer"
              >
                {/* Order Header */}
                <div
                  className={`flex justify-between items-center px-6 py-4 ${
                    order.status === "Accepted"
                      ? "bg-green-50 border-b border-green-100"
                      : order.status === "Rejected"
                      ? "bg-red-50 border-b border-red-100"
                      : "bg-yellow-50 border-b border-yellow-100"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      Order #{order.id.substring().toUpperCase()}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Placed on{" "}
                      {order.createdAt
                        ? new Date(
                            order.createdAt.toDate()
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        order.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex-1 min-w-max">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        SHIPPING TO
                      </h4>
                      <p className="font-medium">{order.fullName}</p>
                      <p className="text-gray-700">{order.address}</p>
                    </div>
                    {order.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          CONTACT
                        </h4>
                        <p className="font-medium">{order.phone}</p>
                      </div>
                    )}
                    {order.totalAmount && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          TOTAL
                        </h4>
                        <p className="font-bold text-lg">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <h4 className="font-medium text-gray-800 mb-3 border-b pb-2">
                    Items Ordered
                  </h4>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        onClick={(e) => handleProductClick(e, item.id)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          order.status === "Accepted"
                            ? "hover:bg-green-50"
                            : order.status === "Rejected"
                            ? "hover:bg-red-50"
                            : "hover:bg-yellow-50"
                        }`}
                      >
                        {/* Product Image Placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <h5 className="font-medium text-gray-800">
                            {item.name}
                          </h5>
                          {item.size && (
                            <p className="text-sm text-gray-600">
                              Size: {item.size}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-bold">₹{item.price}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions - removed the button since the whole card is clickable now */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                  <span className="text-sm text-gray-500">
                    Click anywhere on the card to view order details
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
