import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import SignaturePad from 'react-signature-canvas';

const SignerDashboard = () => {
  const [files, setFiles] = useState({});
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [openSignModal, setOpenSignModal] = useState(null); // documentId
  const [signName, setSignName] = useState('');
  const sigPadRef = useRef(null);

  const fetchDocuments = async () => {
    const res = await axios.get('/sign/signer');
    setFiles(res.data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredFiles(Object.values(files).flat());
    } else {
      setFilteredFiles(files[statusFilter] || []);
    }
  }, [statusFilter, files]);
  const handleSignSubmit = async () => {
    if (!signName) return setError('Enter your name');
    if (sigPadRef.current.isEmpty()) return setError('Please sign before submitting');
    setLoading(true);

    const base64Signature = sigPadRef.current.toDataURL('image/png');

    await axios.post(`/sign/sign`, { 
      name: signName, 
      signature: base64Signature, 
      documentId: openSignModal
    });
    setError('');
    setOpenSignModal(null);
    setSignName('');
    setLoading(false);
    sigPadRef.current.clear();
    fetchDocuments();
  };

  return (
    <div className="dashboard-inner">
      <div className="main-content">
        <div className="view-section">
          <h2>Signer Dashboard</h2>

          {/* Status Tabs */}
          <div className="status-tabs">
              <button 
                onClick={() => setStatusFilter('All')} 
                className={statusFilter === 'All' ? 'active' : ''}
              >
                All
              </button>
              {Object.keys(files).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'active' : ''}
                >
                  {status}
                </button>
              ))}
            </div>

          {/* Table View */}
          <table className="file-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assigned By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                  filteredFiles.map(file => (
                  <tr key={file._id}>
                    <td><a href={file.signedUrl || file.originalUrl} target="_blank">{file.title}</a></td>
                    <td>
                      <span
                        className={`status-badge ${file.status.toLowerCase()}`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td>{file.uploader?.email || 'N/A'}</td>
                    <td>
                      <div className="action-dropdown">
                        <button className="dropdown-btn">⋮</button>
                        <div className="dropdown-menu">
                          <a href={file.signedUrl || file.originalUrl} target="_blank" rel="noreferrer">View</a>
                          {file.status === 'Pending' && (
                            <>
                              <button onClick={() => setOpenSignModal(file._id)}>Sign</button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ): (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No PDFs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature Modal */}
      {openSignModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sign Document</h3>
            <div className="input-group">
              <input 
                type="text"  
                value={signName} 
                onChange={(e) => {
                  setError('');
                  setSignName(e.target.value);
                }} 
              />
              <label>Your Name</label>
            </div>
            <div className="input-group signature-pad">
              <label>Your Signature</label>
              <SignaturePad 
                ref={sigPadRef} 
                penColor="black" 
                canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }} 
              />
            </div>
            {error && <div className="alert error">{error}</div>}
            <div className="modal-actions">
              <button onClick={() => sigPadRef.current.clear()}>Clear</button>
              <button onClick={() => setOpenSignModal(null)}>Cancel</button>
              <button onClick={handleSignSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignerDashboard;
