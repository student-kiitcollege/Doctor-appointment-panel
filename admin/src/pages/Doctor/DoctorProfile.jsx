import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        about: profileData.about,
        available: profileData.available,
      };

      const { data } = await axios.post(
        backendUrl + '/api/doctor/update-profile',
        updateData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return profileData && (
    <div className="flex flex-col gap-4 m-5">
      <div>
        <img
          className="bg-primary/80 w-full sm:max-w-64 rounded-lg object-cover"
          src={profileData.image || "/images/default-avatar.png"}
          alt="Doctor"
        />
      </div>

      <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
        <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
          {profileData.name}
        </p>

        <div className="flex items-center gap-2 mt-1 text-gray-600">
          <p>{profileData.degree} - {profileData.speciality}</p>
          <button className="py-0.5 px-2 border text-xs rounded-full">
            {profileData.experience}
          </button>
        </div>

        {/* ----- About Doctor ----- */}
        <div className="mt-3">
          <p className="text-sm font-medium text-[#262626]">About:</p>
          {
            isEdit ? (
              <textarea
                onChange={(e) =>
                  setProfileData(prev => ({ ...prev, about: e.target.value }))
                }
                value={profileData.about}
                className="w-full outline-primary p-2 mt-1 text-sm border rounded"
                rows={5}
              />
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                {profileData.about}
              </p>
            )
          }
        </div>

        {/* ----- Fees ----- */}
        <p className="text-gray-600 font-medium mt-4">
          Appointment fee:{" "}
          <span className="text-gray-800">
            {currency}{" "}
            {isEdit ? (
              <input
                type="number"
                className="border px-2 py-1 ml-2 rounded"
                value={profileData.fees}
                onChange={(e) =>
                  setProfileData(prev => ({ ...prev, fees: e.target.value }))
                }
              />
            ) : (
              profileData.fees
            )}
          </span>
        </p>

        {/* ----- Address ----- */}
        <div className="flex flex-col gap-1 mt-3 text-sm">
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <>
              <input
                type="text"
                placeholder="Line 1"
                className="border px-2 py-1 rounded"
                value={profileData.address?.line1 || ""}
                onChange={(e) =>
                  setProfileData(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
              />
              <input
                type="text"
                placeholder="Line 2"
                className="border px-2 py-1 rounded"
                value={profileData.address?.line2 || ""}
                onChange={(e) =>
                  setProfileData(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
              />
            </>
          ) : (
            <p>
              {profileData.address?.line1 || "N/A"}
              <br />
              {profileData.address?.line2 || ""}
            </p>
          )}
        </div>

        {/* ----- Availability ----- */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="availableToggle"
            disabled={!isEdit}
            checked={profileData.available}
            onChange={() =>
              isEdit &&
              setProfileData(prev => ({
                ...prev,
                available: !prev.available,
              }))
            }
          />
          <label htmlFor="availableToggle" className="text-sm">
            Available
          </label>
        </div>

        {/* ----- Action Buttons ----- */}
        {isEdit ? (
          <button
            onClick={updateProfile}
            className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
