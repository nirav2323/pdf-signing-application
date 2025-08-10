const s3 = require('../utils/s3');

exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `pdfs/${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const uploaded = await s3.upload(params).promise();
        res.json({
            message: "File uploaded successfully",
            fileUrl: uploaded.Location,
            fileName: req.file.originalname,
            size: req.file.size
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "File upload failed" });
    }
};
