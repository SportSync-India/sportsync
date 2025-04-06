import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { app } from "../../firebase"; // Ensure you have Firebase initialized

const Navbar = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">SportSync</h1>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user.displayName || "User"}</span>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <a href="/login" className="bg-blue-500 px-4 py-2 rounded">
            Sign In
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
