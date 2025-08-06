import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { uploadDocument } from '../redux/uploaderSlice';

const UploaderDashboard = () => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [email, setEmail] = useState('');
  const [signatureArea, setSignatureArea] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchFiles = async () => {
    const res = await axios.get('/documents/uploader');
    setFiles(res.data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !email) return alert('Select file and signer email');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('assignedTo', email);
    formData.append('signatureFields', signatureArea);
    formData.append('title',selectedFile.name)
    dispatch(uploadDocument(formData));
  };

  const handleVerify = async (id,flag) => {
    const raw = JSON.stringify({
      "documentId": id,
      "status": flag?"Verified":"Rejected"
    });
    await axios.post(`/documents/verify`,raw);
    fetchFiles();
  };

  const filteredFiles = statusFilter === 'All'
  ? Object.values(files).flat() 
  : files[statusFilter] || [];

  return (
    <div className="dashboard">
      <h2>Uploader Dashboard</h2>

      <form onSubmit={handleUpload} className="upload-form">
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} required />
        <input type="email" placeholder="Signer Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Signature Area (page,x,y,width,height)" value={signatureArea} onChange={(e) => setSignatureArea(e.target.value)} required />
        <button type="submit">Upload & Assign</button>
      </form>

      <div className="status-tabs">
        <button
          onClick={() => setStatusFilter('All')}
          className={statusFilter === 'All' ? 'active' : ''}
        >All</button>

        {Object.keys(files).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'active' : ''}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="file-list">
        {filteredFiles && filteredFiles.length > 0 ? filteredFiles.map(file => (
          <div key={file._id} className="file-card">
            <p><strong>File:</strong> {file.title}</p>
            <p><strong>Status:</strong> {file.status}</p>
            <p><strong>Assigned To:</strong> {file.assignedTo?.email || 'N/A'}</p>
            <a href={file.s3Url} target="_blank" rel="noreferrer">View PDF</a>
            {file.status === 'Signed' && (
              <div className="action-buttons">
                <button onClick={() => handleVerify(file._id,true)}>Verify</button>
                <button onClick={() => handleVerify(file._id,false)}>Reject</button>
              </div>
            )}
          </div>
        )):
        <p>No data found</p>
        }
      </div>
    </div>
  );
};

export default UploaderDashboard;