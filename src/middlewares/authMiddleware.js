const { getUserBySession } = require('../services/sessionStore');

function requireAuth(req, res, next) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return res.status(401).send("COOKIE HEADER IS NOT FOUND");

    const cookies = Object.fromEntries(
        cookieHeader.split(";").map(c => c.trim().split("="))
    );


    const sessionId = cookies.sessionId;
    const session = getUserBySession(sessionId);


    if (!session) return res.status(401).send("Not authorized");

    req.user = session.userId;
    next();
}

module.exports = { requireAuth };
