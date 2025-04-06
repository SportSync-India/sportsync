import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./component/navbar";
import AddProduct from "./component/Addproduct";
import Auth from "./component/auth"; // Ensure this file exists
import "./App.css";
import Home from "./pages/Home";
import Orders from "./component/orders";
import SingleProductPage from "./component/singleProductPage";
import EditDeleteProduct from "./component/editAndDelete";
import ProductList from "./component/productList";
import Users from "./component/users";
import UserDetails from "./component/userdata";

const App = () => {
  const [user] = useAuthState(auth); // Get the authentication state

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/order/:productId" element={<SingleProductPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:userId" element={<UserDetails />} />
        <Route
          path="/add-product"
          element={
            user ? <AddProduct /> : <p>Please log in to add products.</p>
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route path="/edit/:productId" element={<EditDeleteProduct />} />
        <Route path="/products" element={<ProductList />} />
      </Routes>
    </Router>
  );
};

export default App;
