import React from 'react';
import { useSelector } from 'react-redux';
import UploaderDashboard from '../components/Uploader';
import SignerDashboard from '../components/Signer';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        {user.role === 'uploader' ? <UploaderDashboard /> : <SignerDashboard />}
      </div>
    </>
  );
};

export default Dashboard;
