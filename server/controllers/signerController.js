const Document = require('../models/Document');
const User = require('../models/User');
const Signature = require('../models/Signature');
const s3 = require('../utils/s3');
const { PDFDocument, rgb } = require('pdf-lib');

exports.signDocument = async (req, res) => {
  const { documentId, signature, name } = req.body;
  try {
    const doc = await Document.findById(documentId);
    const user = await User.findById(req.user.userId);
    if (!doc || doc.signer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    let updatedUrl = await signPDF(req,user.email,res);
    const sign = await Signature.create({
      document:documentId,
      signer: req.user.userId,
      signatureImage: signature,
      name: name,
      email: user.email
    });
    doc.status = 'Signed';
    doc.signedUrl = updatedUrl;
    await doc.save();
    res.json({message:"updated"});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.signerDocumentsGrouped = async (req, res) => {
  try {
    const documents = await Document.find({ signer: req.user.userId }).populate('uploader', 'name email');
    const grouped = documents.reduce((acc, doc) => {
      const status = doc.status || 'Unknown';
      if (!acc[status]) acc[status] = [];
      acc[status].push(doc);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    console.error('Error in signerDocumentsGrouped:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const signPDF = async (req,email,res) => {
  try {
    const { documentId, signature, name } = req.body;
    const date = new Date();
    const currentDate = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
    const fileRecord = await Document.findById(documentId);
    const pdfBytes = await fetch(fileRecord.originalUrl).then(res => res.arrayBuffer());
    let { x,y,page = 0 } = fileRecord.signatureFields[0];
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const sigImageBytes = Buffer.from(signature.split(',')[1], 'base64');
    const sigImage = await pdfDoc.embedPng(sigImageBytes);
    const pageData = pdfDoc.getPage(page);
    pageData.drawImage(sigImage, {
      x: x,
      y: y,
      width: 200,
      height: 50
    });
    pageData.drawText(name, { x: x, y: y+50, size: 12, color: rgb(0, 0, 0) });
    pageData.drawText(email, { x: x, y: y+70, size: 12, color: rgb(0, 0, 0) });
    pageData.drawText(currentDate, { x: x, y: y+90, size: 12, color: rgb(0, 0, 0) });
    const updatedPdfBytes = await pdfDoc.save();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `pdfs/${Date.now()}_${fileRecord.title}`,
      Body: Buffer.from(updatedPdfBytes),
      ContentType: 'application/pdf'
    };
    const uploaded = await s3.upload(params).promise();
    return uploaded.Location;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sign document' });
  }
};
