import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./i18n/config.js";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { CartProvider } from "./cart/CartContext.jsx";
import { StoreSettingsProvider } from "./context/StoreSettingsContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <StoreSettingsProvider>
              <App />
            </StoreSettingsProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
