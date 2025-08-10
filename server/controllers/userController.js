const User = require('../models/User');

exports.getAllSigners = async (req, res) => {
  try {
    const signers = await User.find({ role: 'signer' }).select('name email');
    res.json(signers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};