import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"
import Register from "./pages/Register"
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile"
import MyOrders from "./pages/MyOrders"
import OrderSuccess from "./pages/OrderSuccess";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Shipping from "./pages/Shipping";
import Checkout from "./pages/Checkout";  
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentProcess from "./pages/PaymentProcess";

import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageProducts from "./pages/admin/ManageProducts"
import ManageOrders from "./pages/admin/ManageOrders"
import ManageUsers from "./pages/admin/ManageUsers"
import AdminRoute from "./routes/AdminRoute"
import CreateProduct from "./pages/admin/CreateProduct"
import EditProduct from "./pages/admin/EditProduct"



function App() {
  return (
    <BrowserRouter>

      {/* Navbar OUTSIDE Routes */}
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
            <Profile/>
            </ProtectedRoute>
          }
          />
        
        <Route path="/myorders" element={
          <ProtectedRoute>
          <MyOrders/>
          </ProtectedRoute> 
        }
        />

        <Route path="/product/:id" element={
          
          <ProductDetails />
         
          }
         />

        <Route path="/cart" element={
          <ProtectedRoute>
          <Cart />
          </ProtectedRoute>
          } />

        <Route path="/shipping" element={
          <ProtectedRoute>
          <Shipping />
          </ProtectedRoute>
          } />

        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
            </ProtectedRoute>
          } 
        />

        <Route path="/order-success" element={<OrderSuccess />} />

        <Route
        path="/payment-process"
        element={
          <ProtectedRoute>
            <PaymentProcess />
          </ProtectedRoute>
        }
      />
          
          
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
            <Checkout/>
            </ProtectedRoute>
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        <Route path="/orders" element={
            <Orders />
        } />



          {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={    
          <AdminRoute>    
             <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="/admin/products" element={    
          <AdminRoute>    
             <ManageProducts />
          </AdminRoute>
        } />

        <Route path="/admin/orders" element={    
          <AdminRoute>    
             <ManageOrders />
          </AdminRoute>
        } />

        <Route path="/admin/users" element={    
          <AdminRoute>    
             <ManageUsers />
          </AdminRoute>
        } />  
        <Route
          path="/admin/product/create"
          element={<AdminRoute><CreateProduct/></AdminRoute>}
        />

        <Route
          path="/admin/product/:id/edit"
          element={<AdminRoute><EditProduct/></AdminRoute>}
        />
        

              
      </Routes>

    </BrowserRouter>
  );
}

export default App;