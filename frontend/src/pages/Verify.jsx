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
        {
          headers: {
            Authorization: `Bearer ${token}`, // Fix: correct auth header
          },
        }
      );

      if (data.success) {
        toast.success(data.message || 'Payment verified successfully');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error?.response?.data?.message || 'Something went wrong during verification');
    } finally {
      setLoading(false);
      // Small delay before navigation so user can see toast
      setTimeout(() => navigate('/my-appointments'), 1500);
    }
  };

  useEffect(() => {
    if (token && appointmentId && success) {
      verifyStripe();
    } else {
      toast.error('Missing payment verification parameters');
      setLoading(false);
      // Navigate after short delay to allow toast to show
      setTimeout(() => navigate('/my-appointments'), 1500);
    }
  }, [token, appointmentId, success, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {loading && (
        <div className="w-20 h-20 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      )}
      {!loading && (
        <p className="text-center text-gray-600">Redirecting...</p>
      )}
    </div>
  );
};

export default Verify;

