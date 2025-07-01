const { API_BASE_URL } = require('./env');

async function getUserFromCookie(req) {
  const token = req.cookies?.accessToken;
  if (!token) {
    console.warn('[COOKIE] Kein accessToken im Cookie gefunden');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Cookie: `accessToken=${token}` },
    });
    const json = await res.json();

    if (!json.success) {
      console.warn('[AUTH] Fehlerhafte Antwort von /api/users/me', json);
      return null;
    }

    return json.data;
  } catch (e) {
    console.error('[AUTH] Fehler beim Abrufen von /me:', e.message);
    return null;
  }
}

function requireAuth(req, res, next) {
  getUserFromCookie(req).then((user) => {
    if (!user) {
      console.warn(`[AUTH] Zugriff verweigert für ${req.ip} → nicht eingeloggt`);
      return res.redirect('/unauthorized');
    }
    req.user = user;
    next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(
        `[ROLE] Zugriff verweigert für ${req.ip} → benötigte Rollen: [${allowedRoles}], aktuelle Rolle: ${userRole}`
      );
      return res.redirect('/unauthorized'); // oder JSON-Fehler senden
    }
    next();
  };
}

function requireStatus(status) {
  return (req, res, next) => {
    if (!req.user || req.user.status !== status) {
      console.warn(
        `[STATUS] Zugriff verweigert für ${req.ip} → benötigter Status: ${status}, aktueller Status: ${req.user?.status}`
      );
      return res.redirect('/unauthorized');
    }
    next();
  };
}

module.exports = {
  getUserFromCookie,
  requireAuth,
  requireRole,
  requireStatus,
};