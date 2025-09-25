let sessions = []; // { sessionId, userId }

function createSession(userId) {
    const sessionId = Math.random().toString(36).slice(2); // simple random id
    sessions.push({ sessionId, userId });
    return sessionId;
}

function getUserBySession(sessionId) {
    const session = sessions.find(s => s.sessionId === sessionId);
    return session ? session.userId : null;
}

function deleteSession(sessionId) {
    sessions = sessions.filter(s => s.sessionId !== sessionId);
}

module.exports = { createSession, getUserBySession, deleteSession };
