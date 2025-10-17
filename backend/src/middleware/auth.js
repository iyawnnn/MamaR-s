// backend/src/middleware/auth.js
// Placeholder auth: in Phase 2 we accept a static header for admin testing.
// Replace with real JWT verification in Phase 3.

module.exports = (req, res, next) => {
  const token = req.header('authorization') ? req.header('authorization').split(' ')[1] : null;
  // For dev: set a header 'Authorization: Bearer devtoken' OR set process.env.DEV_TOKEN
  if (!token) return res.status(401).json({ message: 'Missing auth token' });
  if (process.env.NODE_ENV === 'development' && token === (process.env.DEV_TOKEN || 'devtoken')) {
    req.user = { email: 'dev@diofanys', role: 'admin' };
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};
