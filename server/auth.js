const users = [
  { username: "admin", password: "!MKMavericksAdmin2026" }
];

module.exports = function authenticate(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: "Unauthorized" });
};
