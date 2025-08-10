const roleCheck = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ msg: 'Forbidden' });
    next();
  };
};

module.exports = roleCheck;
