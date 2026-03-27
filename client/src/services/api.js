import { BASE_URL } from "../config";
import axios from "axios";

const API_URL = BASE_URL;

const API = axios.create({
  baseURL: `${API_URL}/api`
});

API.interceptors.request.use((config) => {

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  if (userInfo?.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }

  return config;

});

export default API;