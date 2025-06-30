import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4001";
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ✅ Format slot date from "20_01_2000" => "20 Jan 2000"
  const slotDateFormat = (slotDate) => {
    try {
      if (!slotDate) return "Invalid Date";

      const dateArray = slotDate.split("_");
      if (dateArray.length !== 3) return "Invalid Date";

      const day = dateArray[0];
      const monthIndex = parseInt(dateArray[1], 10) - 1;
      const year = dateArray[2];

      if (monthIndex < 0 || monthIndex > 11) return "Invalid Date";

      return `${day} ${months[monthIndex]} ${year}`;
    } catch (error) {
      console.error("slotDateFormat error:", error.message);
      return "Invalid Date";
    }
  };

  // ✅ Calculate age from DOB (e.g., "2000-01-20")
  const calculateAge = (dob) => {
    try {
      if (!dob) return "N/A";

      const birthDate = new Date(dob);
      if (isNaN(birthDate)) return "Invalid DOB";

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    } catch (error) {
      console.error("calculateAge error:", error.message);
      return "Invalid DOB";
    }
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
