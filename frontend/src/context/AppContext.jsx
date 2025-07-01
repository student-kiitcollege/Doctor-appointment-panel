import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4001";

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Logout function
  const logoutUser = () => {
    setToken("");
    setUserData(null);
    localStorage.removeItem("token");
    toast.info("You have been logged out");
  };

  // Fetch doctors list
  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to load doctors");
      }
    } catch (error) {
      console.error("Doctor Fetch Error:", error);
      toast.error("Error fetching doctors");
    }
  };

  // Fetch user profile, accepts optional token param to avoid race condition
  const loadUserProfileData = async (tokenParam) => {
    const authToken = tokenParam || token;
    if (!authToken || isLoadingProfile) return;

    setIsLoadingProfile(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (data.success) {
        setUserData(data.userData);
        console.log("✅ User Profile Fetched:", data.userData);
      } else {
        logoutUser();
        toast.error(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("User Profile Error:", error);

      if (error.response?.status === 401 || error.message.includes("token")) {
        logoutUser();
        toast.error("Session expired. Please login again.");
      } else {
        setUserData(null);
        toast.error("Unable to load user profile");
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Helper to set token and immediately load profile with that token
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    loadUserProfileData(newToken);
  };

  // Load doctors list on mount
  useEffect(() => {
    getDoctorsData();
  }, []);

  // On token change, sync localStorage and load profile if no param passed explicitly
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUserProfileData(); // only call if no explicit param used
    } else {
      localStorage.removeItem("token");
      setUserData(null);
    }
  }, [token]);

  const value = {
    currencySymbol,
    backendUrl,
    doctors,
    getDoctorsData,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    logoutUser,
    handleLogin, // expose handleLogin for login component
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
