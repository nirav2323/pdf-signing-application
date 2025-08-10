import React from 'react';
import { useSelector } from 'react-redux';
import UploaderDashboard from '../components/Uploader';
import SignerDashboard from '../components/Signer';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const token = localStorage.getItem('token');
  if(!token){
    location.href = '/login';
  }
  const user = useSelector((state) => state.auth.user);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <div className="dashboard-wrapper">
        {user.role === 'uploader' ? <UploaderDashboard /> : <SignerDashboard />}
      </div>
    </>
  );
};

export default Dashboard;
