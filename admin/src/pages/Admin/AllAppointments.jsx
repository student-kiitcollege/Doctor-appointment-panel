import React, { useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b font-semibold text-gray-600 bg-gray-100">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center justify-between text-gray-700 py-3 px-6 border-b hover:bg-gray-50 transition-all"
          >
            <p className="max-sm:hidden">{index + 1}</p>

            <div className="flex items-center gap-2">
              <img
                src={item?.userData?.image || assets.default_avatar}
                className="w-8 h-8 rounded-full object-cover"
                alt="Patient"
              />
              <p>{item?.userData?.name || "N/A"}</p>
            </div>

            <p className="max-sm:hidden">
              {item?.userData?.dob ? calculateAge(item.userData.dob) : "N/A"}
            </p>

            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>

            <div className="flex items-center gap-2">
              <img
                src={item?.docData?.image || assets.default_avatar}
                className="w-8 h-8 rounded-full object-cover bg-gray-200"
                alt="Doctor"
              />
              <p>{item?.docData?.name || "N/A"}</p>
            </div>

            <p>
              {currency}
              {item?.amount || 0}
            </p>

            {item?.cancelled ? (
              <p className="text-red-500 text-xs font-medium">Cancelled</p>
            ) : item?.isCompleted ? (
              <p className="text-green-600 text-xs font-medium">Completed</p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-8 cursor-pointer hover:scale-105 transition"
                src={assets.cancel_icon}
                alt="Cancel"
                title="Cancel Appointment"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
