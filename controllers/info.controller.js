exports.publicInfo = (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
};

exports.profile = (req, res) => {
  // req.user was attached by the requireAuth middleware
  const { id, email, created_at } = req.user;
  res.status(200).json({ id, email, created_at });
};

exports.dashboard = (req, res) => {
  // Second protected route — proves the middleware is reusable, no new auth code
  const { id, email } = req.user;
  res.status(200).json({ message: `Welcome to your dashboard, ${email}`, id });
};
