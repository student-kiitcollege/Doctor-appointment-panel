import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, userData, logoutUser, loadUserProfileData } = useContext(AppContext);

  // Ensure user profile is loaded after token or userData changes
  useEffect(() => {
    if (token && !userData) {
      loadUserProfileData();
    }
  }, [token, userData, loadUserProfileData]);

  // Handle logout - logout, close menu, navigate home
  const handleLogout = () => {
    logoutUser();
    setShowMenu(false);
    navigate('/');
  };

  // Handle navigation with menu close
  const handleNavigate = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD] px-4 sm:px-10">
      <img
        onClick={() => {
          navigate('/');
          setShowMenu(false);
        }}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />

      {/* Desktop Navigation */}
      <ul className="md:flex items-start gap-5 font-medium hidden">
        <NavLink to="/">
          <li className="py-1 cursor-pointer">HOME</li>
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1 cursor-pointer">ALL DOCTORS</li>
        </NavLink>
        <NavLink to="/about">
          <li className="py-1 cursor-pointer">ABOUT</li>
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1 cursor-pointer">CONTACT</li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 h-8 object-cover rounded-full"
              src={userData.image || assets.user_icon}
              alt="User"
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown" />

            {/* Dropdown */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-gray-50 rounded shadow-lg flex flex-col gap-4 p-4">
                <p
                  onClick={() => handleNavigate('/my-profile')}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => handleNavigate('/my-appointments')}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={handleLogout} className="hover:text-black cursor-pointer text-red-500">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              navigate('/login');
              setShowMenu(false);
            }}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}

        {/* Mobile menu toggle */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt="Menu"
        />

        {/* Mobile Side Menu */}
        <div
          className={`fixed md:hidden top-0 right-0 z-30 bg-white h-full w-[70%] shadow-lg transition-all duration-300 ${
            showMenu ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b">
            <img src={assets.logo} className="w-36" alt="Logo" />
            <img
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              className="w-7 cursor-pointer"
              alt="Close"
            />
          </div>

          <ul className="flex flex-col gap-4 p-6 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/" className="cursor-pointer">
              <p>HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors" className="cursor-pointer">
              <p>ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about" className="cursor-pointer">
              <p>ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact" className="cursor-pointer">
              <p>CONTACT</p>
            </NavLink>

            {token && userData ? (
              <>
                <hr />
                <p onClick={() => handleNavigate('/my-profile')} className="cursor-pointer">
                  My Profile
                </p>
                <p onClick={() => handleNavigate('/my-appointments')} className="cursor-pointer">
                  My Appointments
                </p>
                <p onClick={handleLogout} className="text-red-500 cursor-pointer">
                  Logout
                </p>
              </>
            ) : (
              <p
                onClick={() => {
                  navigate('/login');
                  setShowMenu(false);
                }}
                className="text-primary underline cursor-pointer"
              >
                Login / Create Account
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
