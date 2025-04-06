import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle,
  Package,
  ShoppingBag,
  LogIn,
  Edit,
  Search,
  BarChart2,
  Users,
  Settings,
  BellRing,
} from "lucide-react";

const Home = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const ordersData = [];
        let totalRevenue = 0;

        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };

          // Calculate total revenue from order items
          if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach((item) => {
              if (item.price && item.quantity) {
                totalRevenue += item.price * item.quantity;
              }
            });
          }

          ordersData.push(orderData);
        }

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update state
        setOrders(ordersData);
        setProducts(productsData);
        setUsers(usersData);

        // Set statistics
        setStats({
          totalOrders: ordersData.length,
          totalProducts: productsData.length,
          totalUsers: usersData.length,
          totalRevenue: totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Calculate growth percentages (mock data - in a real app you'd compare with previous periods)
  const growthStats = {
    revenueGrowth: 12,
    ordersGrowth: 8,
    productsGrowth: 3,
    usersGrowth: 7,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Top Navigation */}

      <div className="flex">
        {/* Side Navigation */}
        <aside className="w-20 lg:w-64 h-screen bg-black/30 backdrop-blur-md flex flex-col items-center lg:items-start p-4 border-r border-blue-500/20">
          <div className="mt-6 flex flex-col items-center lg:items-start space-y-6 w-full">
            <Link
              to="/"
              className="flex items-center w-full p-2 rounded-lg bg-blue-600 text-white"
            >
              <BarChart2 size={20} className="mx-auto lg:ml-2 lg:mr-3" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>

            <Link
              to="/products"
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <ShoppingBag size={20} className="mx-auto lg:ml-2 lg:mr-3" />
              <span className="hidden lg:block">Products</span>
            </Link>

            <Link
              to="/orders"
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Package size={20} className="mx-auto lg:ml-2 lg:mr-3" />
              <span className="hidden lg:block">Orders</span>
            </Link>

            <Link
              to="/users"
              className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Users size={20} className="mx-auto lg:ml-2 lg:mr-3" />
              <span className="hidden lg:block">Customers</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Welcome back</h2>
                  <p className="text-gray-400">
                    Here's what's happening with your store today.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link to="/add-product">
                    <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      <PlusCircle size={18} className="mr-2" />
                      Add Product
                    </button>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400">Total Revenue</p>
                      <h3 className="text-2xl font-bold mt-1">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </h3>
                      <p className="text-green-500 text-sm mt-2">
                        ↑ {growthStats.revenueGrowth}% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <BarChart2 size={24} className="text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {stats.totalOrders}
                      </h3>
                      <p className="text-green-500 text-sm mt-2">
                        ↑ {growthStats.ordersGrowth}% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Package size={24} className="text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400">Total Products</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {stats.totalProducts}
                      </h3>
                      <p className="text-green-500 text-sm mt-2">
                        ↑ {growthStats.productsGrowth}% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400">Total Users</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {stats.totalUsers}
                      </h3>
                      <p className="text-green-500 text-sm mt-2">
                        ↑ {growthStats.usersGrowth}% from last month
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Users size={24} className="text-red-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Link
                    to="/add-product"
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-500/50 border border-gray-700 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PlusCircle size={24} />
                    </div>
                    <p className="font-medium">Add Product</p>
                  </Link>

                  <Link
                    to="/orders"
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-500/50 border border-gray-700 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Package size={24} />
                    </div>
                    <p className="font-medium">View Orders</p>
                  </Link>

                  <Link
                    to="/products"
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-500/50 border border-gray-700 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="font-medium">Product List</p>
                  </Link>

                  <Link
                    to="/products"
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-500/50 border border-gray-700 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-full bg-yellow-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Edit size={24} />
                    </div>
                    <p className="font-medium">Edit Product</p>
                  </Link>

                  <Link
                    to="/users"
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-blue-500/50 border border-gray-700 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <p className="font-medium">View Users</p>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700">
                  <div className="px-4 py-5 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">
                      Recent Orders
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {order.id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {order.fullName || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {order.items && Array.isArray(order.items)
                                ? order.items.length
                                : 0}{" "}
                              items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {order.timestamp
                                ? new Date(order.timestamp).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700">
                  <div className="px-4 py-5 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">
                      Recent Activity
                    </h3>
                  </div>
                  <div>
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-green-400 font-medium">
                        New order #{orders[0]?.id.substring(0, 4) || "1082"}
                      </p>
                      <p className="text-gray-400 text-sm">2 minutes ago</p>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-yellow-400 font-medium">
                        Product stock low:{" "}
                        {products[0]?.name || "Sports Equipment"}
                      </p>
                      <p className="text-gray-400 text-sm">15 minutes ago</p>
                    </div>
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-blue-400 font-medium">
                        New customer registration:{" "}
                        {users[0]?.fullName || "Customer"}
                      </p>
                      <p className="text-gray-400 text-sm">1 hour ago</p>
                    </div>
                    <div className="p-4">
                      <p className="text-red-400 font-medium">
                        Payment failed #
                        {orders[1]?.id.substring(0, 4) || "1081"}
                      </p>
                      <p className="text-gray-400 text-sm">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products and Users */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Products */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700">
                  <div className="px-4 py-5 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">
                      Popular Products
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-700">
                    {products.slice(0, 5).map((product) => (
                      <li key={product.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-700 overflow-hidden">
                              {product.imageUrl && (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-10 w-10 object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-image.png";
                                  }}
                                />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {product.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-green-400">
                            ₹{product.price}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Users */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700">
                  <div className="px-4 py-5 border-b border-gray-700">
                    <h3 className="text-lg font-medium text-white">
                      Recent Users
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-700">
                    {users.slice(0, 5).map((user) => (
                      <li key={user.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.address}
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
