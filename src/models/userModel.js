const pool = require('../../config/db'); // your db connection

const getUser = async () => {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
};

const getUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};


const createUser = async (fname, email, password) => {
    const result = await pool.query(
        'INSERT INTO users (fname, email, password) VALUES ($1, $2, $3) RETURNING *',
        [fname, email, password]
    );
    return result.rows[0];
};

module.exports = { getUser, createUser , getUserByEmail };
