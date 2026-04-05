import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ApiService from "./services/api_service.jsx";
import "./index.css";

const root = document.getElementById("root");

ApiService.base_uri = import.meta.env.VITE_API_URL;
await ApiService.checkCredentials();


ReactDOM.createRoot(root).render(<App />);
