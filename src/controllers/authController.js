const { login, register } = require('../services/authService');
const { createSession, deleteSession } = require("../services/sessionStore");

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await login(email, password);

        if (!result.object) {
            return res.status(401).json({ message: result.message });
        }

        const sessionId = createSession(email);
        console.log(`sessionId: ${sessionId}`);

        res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; Path=/`);
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body; // use 'name' from request
        const result = await register(name, email, password);

        if (!result.object) {
            return res.status(401).json({ message: result.message });
        }

        res.json(result);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

const logoutController = (req, res) => {
    const cookies = req.headers.cookie?.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=');
        acc[k] = v;
        return acc;
    }, {});

    if (cookies?.sessionId) {
        deleteSession(cookies.sessionId);
    }
    res.json({ message: "Logged out" });
};

module.exports = { loginController, signupController , logoutController };
