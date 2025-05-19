import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./app/store";
import "./index.css";

// Global error handler for development
if (import.meta.env.DEV) {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global error:", { message, source, lineno, colno, error });
    return false;
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
