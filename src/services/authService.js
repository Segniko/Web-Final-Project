const { createUser } = require('../models/userModel.js');
const { getUserByEmail } = require('../models/userModel.js');

class Response {
    constructor(object=null, message='') {
        this.object = object;
        this.message = message;
    }
}

const login = async (email, password) => {
    let user = await getUserByEmail(email);
    if (!user) {
        console.error('User not found');
        return new Response(null, 'User not found or invalid email');
    } else {
        if (user.password === password) {
            return new Response(user, 'Successfully logged in');
        } else {
            console.error('Wrong password');
            return new Response(null, 'Wrong password');
        }
    }
};

const register = async (fname, email, password) => {
    let user = await getUserByEmail(email);
    if (!user) {
        let newUser = await createUser(fname, email, password);
        return new Response(newUser, 'User created successfully');
    } else {
        console.error('user already exist');
        return new Response(null, 'User already registered');
    }
}

module.exports = { login , register };