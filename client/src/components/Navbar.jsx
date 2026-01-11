import React, { useState, useContext } from 'react';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { Wallet } from 'lucide-react';
import { AuthContext } from '../auth/authProvider';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const NavLink = ({ href, children }) => (
    <li>
      <a href={href} className="text-sm font-medium transition-colors text-slate-600 hover:text-indigo-600">
        {children}
      </a>
    </li>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="flex items-center justify-between max-w-screen-xl px-4 py-4 mx-auto sm:px-8 md:px-16">
        <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 transition-transform bg-indigo-600 rounded-lg group-hover:scale-105 shadow-indigo-100 shadow-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Ledger<span className="text-indigo-600">X</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
             <div className='flex items-center gap-6'>
                <div className='text-right hidden lg:block'>
                  <h1 className='text-sm font-semibold text-slate-800'>{user.fname} {user.lname}</h1>
                  <p className='text-xs text-slate-500 capitalize'>{user.role}</p>
                </div>
                <button onClick={logout} className="px-5 py-2 text-sm font-bold text-white transition-all transform bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg">
                  Logout
                </button>
             </div>
          ) : (
            <>
              <ul className="flex items-center gap-8">
                <NavLink href="/#features">Features</NavLink>
                <NavLink href="/#benefits">Benefits</NavLink>
                <NavLink href="/#contact">Contact</NavLink>
              </ul>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-bold text-white transition-all transform bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="text-2xl text-slate-700 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 border-t border-slate-100' : 'max-h-0'}`}>
        <ul className="flex flex-col gap-4 p-6 bg-white">
          <li><a href="/#features" className='block font-medium text-slate-600' onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="/#benefits" className='block font-medium text-slate-600' onClick={() => setMenuOpen(false)}>Benefits</a></li>
          <li><a href="/#contact" className='block font-medium text-slate-600' onClick={() => setMenuOpen(false)}>Contact</a></li>
          {!user && (
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
               <Link to="/login" className="block w-full py-3 font-semibold text-center text-slate-700 bg-slate-50 rounded-xl" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="block w-full py-3 font-semibold text-center text-white bg-indigo-600 rounded-xl" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
          {user && (
             <li><button onClick={logout} className="w-full text-left font-medium text-red-600">Logout</button></li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;