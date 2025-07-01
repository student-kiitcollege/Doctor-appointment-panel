import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { token, userData, logoutUser } = useContext(AppContext);

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD] px-4 sm:px-10'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="Logo" />

      {/* Desktop Navigation */}
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/'><li className='py-1'>HOME</li></NavLink>
        <NavLink to='/doctors'><li className='py-1'>ALL DOCTORS</li></NavLink>
        <NavLink to='/about'><li className='py-1'>ABOUT</li></NavLink>
        <NavLink to='/contact'><li className='py-1'>CONTACT</li></NavLink>
      </ul>

      <div className='flex items-center gap-4'>
        {token && userData ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 h-8 object-cover rounded-full' src={userData.image || assets.user_icon} alt="User" />
            <img className='w-2.5' src={assets.dropdown_icon} alt="Dropdown" />

            {/* Dropdown */}
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-gray-50 rounded shadow-lg flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                <p onClick={logoutUser} className='hover:text-black cursor-pointer text-red-500'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>
            Create account
          </button>
        )}

        {/* Mobile menu toggle */}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden cursor-pointer' src={assets.menu_icon} alt="Menu" />

        {/* Mobile Side Menu */}
        <div className={`fixed md:hidden top-0 right-0 z-30 bg-white h-full w-[70%] shadow-lg transition-all duration-300 ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex justify-between items-center p-5 border-b'>
            <img src={assets.logo} className='w-36' alt="Logo" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7 cursor-pointer' alt="Close" />
          </div>

          <ul className='flex flex-col gap-4 p-6 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p>ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'><p>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'><p>CONTACT</p></NavLink>

            {token && userData ? (
              <>
                <hr />
                <p onClick={() => { navigate('/my-profile'); setShowMenu(false); }}>My Profile</p>
                <p onClick={() => { navigate('/my-appointments'); setShowMenu(false); }}>My Appointments</p>
                <p onClick={() => { logoutUser(); setShowMenu(false); }} className="text-red-500">Logout</p>
              </>
            ) : (
              <p onClick={() => { navigate('/login'); setShowMenu(false); }} className='text-primary underline'>Login / Create Account</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
