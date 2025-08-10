import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { useDispatch } from 'react-redux';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const UploaderDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('view');
  const [files, setFiles] = useState({});
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileUploadedData, setFileUploadedData] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [signatureCoords, setSignatureCoords] = useState(null);
  const [signers, setSigners] = useState([]);
  const [selectedSigner, setSelectedSigner] = useState('');

  // PDF navigation
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageWrapperRef = useRef(null);

  const fetchFiles = async () => {
    const res = await axios.get('/upload/uploader');
    setFiles(res.data);
  };

  const fetchSigners = async () => {
    const res = await axios.get('/user/signers');
    setSigners(res.data);
  };

  useEffect(() => {
    fetchFiles();
    fetchSigners();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredFiles(Object.values(files).flat());
    } else {
      setFilteredFiles(files[statusFilter] || []);
    }
  }, [statusFilter, files]);

  const handleFileChange = async (e) => {
    setError('');
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setSelectedFile(file);
    setPdfPreview(URL.createObjectURL(file));
    setFileUploadedData({ fileUrl: response.data.fileUrl, fileName: response.data.fileName });
    setCurrentPage(1);
    setSignatureCoords(null);
  };

  const handlePdfClick = (e) => {
    if (!pageWrapperRef.current) return;

    const rect = pageWrapperRef.current.getBoundingClientRect();
    const scaleX = 595 / rect.width; // assuming PDF width 595pt (A4)
    const scaleY = 842 / rect.height; // assuming PDF height 842pt (A4)

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    console.log('x',x,'y',y)
    setSignatureCoords({
      x,
      y,
      page: currentPage,
      width: 200,
      height: 100
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedSigner || !signatureCoords) return setError('Complete all fields');
    const { fileUrl, fileName } = fileUploadedData;
    if (!(fileUrl && fileName)) {
      return setError('PDF uploading in process');
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('originalUrl', fileUrl);
    formData.append('signerId', selectedSigner);
    formData.append('signatureFields', JSON.stringify(signatureCoords));
    formData.append('title', fileName);
    const response = await axios.post('/upload/assign', formData);
    setLoading(false);
    fetchFiles();
    setPdfPreview(null);
    setSelectedFile(null);
    setSelectedSigner(null);
    setSignatureCoords(null);
    setActiveTab('view')
  };

  const handleVerify = async (id, flag) => {
    const raw = JSON.stringify({
      documentId: id,
      status: flag ? 'Verified' : 'Rejected'
    });
    await axios.post(`/upload/status`, raw);
    fetchFiles();
  };

  return (
    <div className="dashboard-inner">
      {/* Sidebar */}
      <div className="sidebar">
        <p className='sidebar-title'>Dashboard</p>
        <button className={activeTab === 'view' ? 'active' : ''} onClick={() => setActiveTab('view')}>
          View All PDFs
        </button>
        <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
          Upload PDF
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <h2>Upload & Assign Signature</h2>
            <div className='upload-form'>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />

              {pdfPreview && (
                <div>
                  <div className="pdf-navigation">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Prev</button>
                    <span>Page {currentPage} of {numPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>Next</button>
                  </div>

                  <div className="pdf-preview" ref={pageWrapperRef} onClick={handlePdfClick}>
                    <Document file={pdfPreview} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                      <Page pageNumber={currentPage} width={500} renderTextLayer={false} renderAnnotationLayer={false} />
                      {signatureCoords && signatureCoords.page === currentPage && (
                        <div
                          className="signature-box"
                          style={{
                            position: 'absolute',
                            top: `${(signatureCoords.y / 842) * 100}%`,
                            left: `${(signatureCoords.x / 595) * 100}%`,
                            width: `${(signatureCoords.width / 595) * 100}%`,
                            height: `${(signatureCoords.height / 842) * 100}%`,
                            border: '2px dashed red',
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                    </Document>
                  </div>
                </div>
              )}

              <select value={selectedSigner} onChange={(e) => { setError(''); setSelectedSigner(e.target.value); }}>
                <option value="">Select Signer</option>
                {signers.map(s => (
                  <option key={s._id} value={s._id}>{s.email}</option>
                ))}
              </select>
              {error && <div className="alert error">{error}</div>}
              <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <h2>All PDFs</h2>
            <div className="status-tabs">
              <button onClick={() => setStatusFilter('All')} className={statusFilter === 'All' ? 'active' : ''}>
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
            <table className="file-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Signer</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map(file => (
                    <tr key={file._id}>
                      <td><a href={file.signedUrl || file.originalUrl} target="_blank">{file.title}</a></td>
                      <td>
                        <span className={`status-badge ${file.status.toLowerCase()}`}>
                          {file.status}
                        </span>
                      </td>
                      <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                      <td>{file.signer.email || 'N/A'}</td>
                      <td>
                        <div className="action-dropdown">
                          <button className="dropdown-btn">⋮</button>
                          <div className="dropdown-menu">
                            <a href={file.signedUrl || file.originalUrl} target="_blank" rel="noreferrer">View</a>
                            {file.status === 'Signed' && (
                              <>
                                <button onClick={() => handleVerify(file._id, true)}>Verify</button>
                                <button onClick={() => handleVerify(file._id, false)}>Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No PDFs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploaderDashboard;
