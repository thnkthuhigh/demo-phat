import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update with your actual API URL
});

export default api;
