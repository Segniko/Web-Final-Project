const pool = require('../../config/db'); // your db connection

const getUser = async () => {
    const result = await pool.query('SELECT * FROM admin');
    return result.rows;
};

const getUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    return result.rows[0] || null;
};

module.exports = { getUser, getUserByEmail };
