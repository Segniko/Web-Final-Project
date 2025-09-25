const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

app.use(express.json());
// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path, stat) => {
        console.log('Serving static file:', path);
    }
}));

const authroutes = require('./src/routes/authRoutes.js');
const {requireAuth} = require("./src/middlewares/authMiddleware");
app.use('/auth', authroutes);


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'landing.html'));
});

app.get('/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' ,'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' , 'signup.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'faq.html'));
});

app.get('/returns', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'returns.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'about.html'));
});
app.get('/service', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html' , 'customer-service.html'));
});

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'profile.html'));
});

app.get('/categories/men', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'category' , 'Men.html'));
});

app.get('/categories/women', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'category' , 'Women.html'));
});

app.get('/categories/electronics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'category' , 'Electronics.html'));
});

// listening for requests on the port specified
app.listen(port, host, () => {
    console.log(`Listening at ${host}:${port}`);
})