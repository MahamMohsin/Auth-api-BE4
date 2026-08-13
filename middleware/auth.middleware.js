const supabase = require('../supabaseClient');

// Extracts the Bearer token from the Authorization header.
// Returns null if the header is missing, malformed, or has no token.
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

// Middleware: guards any route it's applied to.
// - No/malformed token           -> 401 "Access token required"
// - Token present but invalid    -> 401 "Invalid or expired token"
// - Token valid                  -> attaches req.user, calls next()
async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  req.token = token; // some routes (e.g. logout) need the raw token too
  next();
}

module.exports = { requireAuth, extractToken };
