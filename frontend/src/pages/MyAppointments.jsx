import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return "Invalid date";
    const dateArray = slotDate.split('_');
    if (dateArray.length !== 3) return slotDate; // fallback

    const day = dateArray[0];
    const monthIndex = Number(dateArray[1]) - 1;
    const year = dateArray[2];
    if (monthIndex < 0 || monthIndex > 11) return slotDate; // fallback

    return `${day} ${months[monthIndex]} ${year}`;
  };

  const getUserAppointments = async () => {
    if (!token) {
      toast.error("Please login to view appointments");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || "Failed to load appointments");
      }
    } catch (error) {
      console.error("Appointment Fetch Error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setCancellingId(appointmentId);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, {
        appointmentId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        toast.success(data.message);
        getUserAppointments(); // Reload after cancel
      } else {
        toast.error(data.message || "Could not cancel appointment");
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      toast.error("Something went wrong while cancelling appointment");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    } else {
      navigate('/login');
    }
  }, [token]);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-[60vh]">
      <p className="pb-3 mt-12 text-lg font-medium text-gray-600 border-b">My Appointments</p>

      {loading ? (
        <p className="text-gray-500 mt-6">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-500 mt-6">No appointments found.</p>
      ) : (
        appointments.map((item, index) => (
          <div key={item._id || index} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b">
            <div>
              <img
                className="w-36 bg-[#EAEFFF] rounded-md object-cover"
                src={item.docData?.image || assets.default_avatar}
                alt={item.docData?.name || "Doctor"}
              />
            </div>

            <div className="flex-1 text-sm text-[#5E5E5E]">
              <p className="text-[#262626] text-base font-semibold">{item.docData?.name || 'Unknown Doctor'}</p>
              <p>{item.docData?.speciality || 'Speciality not available'}</p>
              <p className="text-[#464646] font-medium mt-1">Address:</p>
              <p>{item.docData?.address?.line1 || '-'}</p>
              <p>{item.docData?.address?.line2 || '-'}</p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">Date & Time:</span>{' '}
                {slotDateFormat(item.slotDate)} | {item.slotTime || '-'}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end text-sm text-center min-w-[140px]">
              {!item.payment && !item.cancelled && !item.isCompleted && (
                <a
                  href="https://u.payu.in/PAYUMN/prh1BmSrzvwC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-green-300 hover:text-white transition-all duration-300"
                >
                  Pay Online
                </a>
              )}

              {item.payment && !item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded bg-[#EAEFFF] text-[#696969]" disabled>
                  Paid
                </button>
              )}

              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500" disabled>
                  Completed
                </button>
              )}

              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  disabled={cancellingId === item._id}
                >
                  {cancellingId === item._id ? "Cancelling..." : "Cancel Appointment"}
                </button>
              )}

              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500" disabled>
                  Appointment Cancelled
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyAppointments;
