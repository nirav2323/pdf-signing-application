import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const SignerDashboard = () => {
  const [documents, setDocuments] = useState({});
  const [activeTab, setActiveTab] = useState('Pending');
  const [signatureData, setSignatureData] = useState({});

  const fetchDocuments = async () => {
    const res = await axios.get('/documents/signer');
    setDocuments(res.data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleInputChange = (fileId, field, value) => {
    setSignatureData(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [field]: value
      }
    }));
  };

  const handleSign = async (e, fileId) => {
    e.preventDefault();
    const { name, signature } = signatureData[fileId] || {};
    if (!name || !signature) return alert('Fill all fields');

    await axios.post(`/documents/sign`, { name, signature, documentId:fileId });
    fetchDocuments();
    setSignatureData(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const statusTabs = Object.keys(documents);

  return (
    <div className="dashboard">
      <h2>Signer Dashboard</h2>

      <div className="status-tabs">
        {statusTabs.map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={activeTab === status ? 'active' : ''}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="file-list">
        {Object.keys(documents).length === 0 && <p>No data found</p>}
        {documents[activeTab]?.map(file => (
          <div key={file._id} className="file-card">
            <p><strong>File:</strong> {file.title}</p>
            <p><strong>Status:</strong> {file.status}</p>
            <a href={file.s3Url} target="_blank" rel="noreferrer">View PDF</a>

            {file.status === 'Pending' && (
              <form onSubmit={(e) => handleSign(e, file._id)} className="sign-form">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={signatureData[file._id]?.name || ''}
                  onChange={(e) => handleInputChange(file._id, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Signature"
                  value={signatureData[file._id]?.signature || ''}
                  onChange={(e) => handleInputChange(file._id, 'signature', e.target.value)}
                  required
                />
                <button type="submit">Submit Signature</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignerDashboard;
