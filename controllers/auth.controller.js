const supabase = require('../supabaseClient');

exports.signup = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ user: data.user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: data.user,
  });
};

exports.logout = async (req, res) => {
  // Note: with the anon key (no service_role), a stateless backend can't force-invalidate
  // one specific user's JWT server-side — that's a known JWT limitation, not a bug here
  // (see the "expiry experiment" extra: a still-valid JWT keeps working even after this call,
  // until it naturally expires). This calls Supabase's own signOut to close out the session
  // this client is aware of; the real logout contract in a stateless API is "the client discards
  // the token" after a 204 confirms the request succeeded.
  await supabase.auth.signOut();
  res.status(204).send();
};
