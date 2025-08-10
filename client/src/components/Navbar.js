import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Link, Navigate, Route, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={user ? '/' : '/login'}>
          <img src="https://pdf-signer-uploads.s3.us-east-1.amazonaws.com/images/logo.jpg" alt="pdf-verifier" />
        </Link>
      </div>
      <div className="menu-links">
        {user ?
          <Link to="/">Dashboard</Link>
          :
          <Link to="/login">Dashboard</Link>
        }
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user">
              Hello {user.name}
            </span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
