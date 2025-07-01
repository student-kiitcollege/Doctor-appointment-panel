import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, handleLogin } = useContext(AppContext);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (loading) return; // prevent multiple submits

    try {
      setLoading(true);
      let response;

      if (isSignUp) {
        if (!name.trim() || !email.trim() || !password) {
          toast.error("All fields are required");
          setLoading(false);
          return;
        }

        response = await axios.post(`${backendUrl}/api/user/register`, {
          name: name.trim(),
          email: email.trim(),
          password,
        });
      } else {
        if (!email.trim() || !password) {
          toast.error("Email and password are required");
          setLoading(false);
          return;
        }

        response = await axios.post(`${backendUrl}/api/user/login`, {
          email: email.trim(),
          password,
        });
      }

      const { data } = response;

      if (data.success && data.token) {
        handleLogin(data.token);
        toast.success(isSignUp ? "Account created successfully" : "Login successful");
        clearForm();
        navigate('/my-appointments');
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error("Auth Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col gap-3 p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-white">
        <p className="text-2xl font-semibold">{isSignUp ? 'Create Account' : 'Login'}</p>
        <p className="mb-2">Please {isSignUp ? 'sign up' : 'log in'} to book appointment</p>

        {isSignUp && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#DADADA] rounded w-full p-2 mt-1"
              placeholder="Enter your name"
              required
              disabled={loading}
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-primary text-white w-full py-2 my-2 rounded-md text-base hover:opacity-90 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (isSignUp ? "Creating Account..." : "Logging in...") : (isSignUp ? 'Create Account' : 'Login')}
        </button>

        <p className="text-center">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span
                onClick={() => !loading && setIsSignUp(false)}
                className="text-blue-500 underline cursor-pointer hover:text-blue-600"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create a new account?{' '}
              <span
                onClick={() => !loading && setIsSignUp(true)}
                className="text-blue-500 underline cursor-pointer hover:text-blue-600"
              >
                Click here
              </span>
            </>
          )}
        </p>
      </div>
    </form>
  );
};

export default Login;
