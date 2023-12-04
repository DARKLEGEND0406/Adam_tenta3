const express = require('express');
const session = require('express-session');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/index.html');
}
);

app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password,
                role:userRole,
            }
        });
        req.session.user = user;
        req.session.userId = user.id;
        req.session.role = user.role;
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.send('Användarnamnet är upptaget eller ogiltigt.');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
                username
            }
        });
        if (user && user.password === password) {
            req.session.userId = user.id;
            req.session.role = user.role;
            res.redirect('/home');
        } else {
            res.send('Fel användarnamn eller lösenord.');
        }
    } catch (error) {
        console.error(error);
        res.send('Något gick fel.');
    }
});

app.get('/home', (req, res) => {
    if (req.session.userId) {
        console.log(req.session.userId);
        console.log(req.session.role);
        if (req.session.role === 'ADMIN') {
            res.sendFile(__dirname + '/public/admin.html');
        } else {
            res.sendFile(__dirname + '/public/user.html');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.post('/create', upload.single("image"), async (req, res) => {
    if (req.session.role === 'ADMIN') {
        const { title, description, } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        try {
            const post = await prisma.post.create({
                data: {
                    title,
                    description,
                    image,
                    authorId: req.session.userId
                }
            });
            res.redirect('/home');
        } catch (error) {
            console.error(error);
            res.send('Något gick fel.');
        }
    } else {
    console.log("du suger")    }
});

app.get('/posts', async (req, res) => {
    if (req.session.role === "USER") {
        try {
            const posts = await prisma.post.findMany({
                include: {
                    author: true
                }
            });
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.send('Något gick fel.');
        }
    } else {
        res.redirect('/');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
