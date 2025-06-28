import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4001";
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Format slot date from "20_01_2000" => "20 Jan 2000"
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    const day = dateArray[0];
    const monthIndex = parseInt(dateArray[1], 10) - 1; // adjust month to 0-based
    const year = dateArray[2];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  // Calculate age from DOB (e.g., "2000-01-20")
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const value = {
    backendUrl,
    currency,
    slotDateFormat,
    calculateAge,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;
