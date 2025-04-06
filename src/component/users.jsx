import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
        setFilteredUsers(userList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users: ", err);
        setError("Failed to load users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm) ||
          user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="text-red-500 text-lg font-medium mb-2">Error</div>
        <p className="text-gray-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                User Directory
              </h1>
              <p className="text-gray-500">
                Manage and view all registered users
              </p>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex rounded-md overflow-hidden">
                <button
                  className={`px-3 py-2 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </button>
                <button
                  className={`px-3 py-2 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Count */}
        <div className="mb-4 flex items-center text-gray-600">
          <User size={16} className="mr-2" />
          <span>{filteredUsers.length} users found</span>
          {searchTerm && (
            <button
              className="ml-3 text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </button>
          )}
        </div>

        {/* No Users Message */}
        {filteredUsers.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">
              <User size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No users found
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "There are no users registered in the system yet."}
            </p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="bg-blue-50 p-4 flex justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.name}'s profile`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/100/100";
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg text-gray-800 mb-1">
                    {user.name || "Unnamed User"}
                  </h2>

                  {user.role && (
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {user.role}
                    </p>
                  )}

                  {user.email && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Mail size={14} className="mr-2" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Phone size={14} className="mr-2" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <span className="text-blue-600 text-sm font-medium flex items-center justify-end">
                    View Profile <ChevronRight size={16} className="ml-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="p-4 flex items-center">
                    <div className="mr-4 flex-shrink-0">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={`${user.name}'s profile`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/48/48";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {getInitials(user.name)}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 truncate">
                          {user.name || "Unnamed User"}
                        </h2>
                        {user.role && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium ml-2 hidden sm:block">
                            {user.role}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                        {user.email && (
                          <div className="flex items-center truncate">
                            <Mail size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}

                        {user.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1 flex-shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}

                        {user.location && (
                          <div className="flex items-center truncate">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-gray-400 ml-4 flex-shrink-0"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
