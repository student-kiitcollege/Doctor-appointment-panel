import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const appointmentId = searchParams.get('appointmentId');

  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const verifyStripe = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/verifyStripe`,
        { success, appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      navigate('/my-appointments');
    }
  };

  useEffect(() => {
    if (token && appointmentId && success) {
      verifyStripe();
    } else {
      toast.error('Missing payment verification parameters');
      navigate('/my-appointments');
    }
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {loading && (
        <div className="w-20 h-20 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      )}
    </div>
  );
};

export default Verify;
