# 📄 PDF Signing Application

A full-stack role-based application that allows **Uploaders** to assign PDFs for signing and **Signers** to sign and submit documents. Built using React, Node.js, MongoDB, and AWS S3.

---

## 🛠️ Tech Stack

- **Frontend**: React, Redux, SCSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT
- **File Storage**: AWS S3

---

## 📦 Setup Instructions

### 🔧 Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in environment variables (see below)
npm run dev

.env format for backend
env
Copy
Edit
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name
Server runs at http://localhost:5001


💻 Frontend Setup
cd client
npm install
npm run start
Frontend runs at http://localhost:3000

User Schema
{
  name: String,
  email: String,
  password: String, // hashed
  role: { type: String, enum: ['uploader', 'signer'] }
}


Document Schema

{
  title: String,
  s3Key: String,
  s3Url: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signatureFields: [{ page, x, y, width, height, type }],
  status: { type: String, enum: ['Pending', 'Signed', 'Verified', 'Rejected'], default: 'Pending' },
  signedFields: {
    signature: String,
    name: String,
    email: String,
    date: Date
  }
}