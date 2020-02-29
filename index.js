const express = require('express');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const server = express();
const moment = require('moment');
require('dotenv').config();

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbDialect = process.env.DB_DIALECT;
const dbReconnectTimeout = process.env.DB_RECONNECT_TIMEOUT;

const sequelize = new Sequelize(
    dbName, dbUser, dbPass, {
    'host': dbHost,
    'port': dbPort,
    'dialect': dbDialect
});

const User = sequelize.define('user', {
    'login': {
        'type': Sequelize.STRING(64),
        'allowNull': false,
        'unique': true
    },
    'password': {
        'type': Sequelize.STRING(256),
        'allowNull': false
    },
    'administrator': {
        'type': Sequelize.BOOLEAN,
        'allowNull': false,
        'defaultValue': false
    }
});

const Message = sequelize.define('message', {
    'content': {
        'type': Sequelize.STRING(140),
        'allowNull': false
    }
});

User.hasMany(Message);
Message.belongsTo(User);

const port = process.env.PORT;

server.set('view engine', 'ejs');
server.use(express.static('public'));
server.use(express.urlencoded({ 'extended': true }));
server.use(session({
    'secret': process.env.SESSION_SECRET,
    'resave': false,
    'saveUninitialized': true
}));
server.locals.moment = moment;

server.get('/', (request, response) => {
    Message.findAll({
        'include': [{
            'model': User
        }]
    }).then(messages => {
        response.render('index', { messages, 'session': request.session });
    }).catch(error => {
        console.error(error);
        response.status(503).end('Service Unavailable');
    });
});

server.get('/login', (request, response) => {
    response.render('login', { 'session': request.session });
});

server.post('/login', (request, response) => {
    const login = (request.body.login || '').trim();
    if (!login) {
        request.session.error = 'Login can not be empty.';
        response.redirect('/login');
        return;
    }

    const password = (request.body.password || '').trim();
    if (!password) {
        request.session.error = 'Password can not be empty.';
        response.redirect('/login');
        return;
    }

    User.findOne({ 'where': { login } }).then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
            request.session.authorized = true;
            request.session.userID  = user.id;
            request.session.login  = user.login;
            request.session.administrator = user.administrator;
            response.redirect('/');
        } else {
            request.session.error = 'Failed to login.';
            response.redirect('/login');
        }
    }).catch(error => {
        console.error(error);
        response.status(503).end('Service Unavailable');
    });
});

server.post('/logout', (request, response) => {
    request.session.regenerate(error => {
        if (error) {
            console.error(error);
        }

        response.redirect('/');
    });
});

server.get('/register', (request, response) => {
    response.render('register', { 'session': request.session });
});

server.post('/register', (request, response) => {
    const login = (request.body.login || '').trim();
    if (!login) {
        request.session.error = 'Login can not be empty.';
        response.redirect('/register');
        return;
    }

    const password = (request.body.password || '').trim();
    if (!password) {
        request.session.error = 'Password can not be empty.';
        response.redirect('/register');
        return;
    }

    const passwordRepeat = (request.body['password-repeat'] || '').trim();
    if (!passwordRepeat) {
        request.session.error = 'Password has to be repeated twice.';
        response.redirect('/register');
        return;
    }

    if (password !== passwordRepeat) {
        request.session.error = 'Password are not the same.';
        response.redirect('/register');
        return;
    }

    User.findOne({ 'where': { login } }).then(user => {
        if (user) {
            request.session.error = 'The login is occupied. Select anothe one.';
            response.redirect('/register');
        } else {
            const hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
            return User.create({
                'login': login,
                'password': hashedPass,
                'administrator': false
            }).then(user => {
                request.session.authorized = true;
                request.session.userID  = user.id;
                request.session.login  = user.login;
                request.session.administrator = user.administrator;
                response.redirect('/');
            });
        }
    }).catch(error => {
        console.error(error);
        response.status(503).end('Service Unavailable');
    });
});

server.post('/message/create', (request, response) => {
    if (!request.session.authorized) {
        response.status(401).end('Unauthorized');
        return;
    }

    const content = request.body.content;
    if (!content) {
        request.session.error = "The message can't be empty.";
        response.redirect('/');
        return;
    }

    Message.create({
        content, 'userId': request.session.userID
    }).then(message => {
        response.redirect('/');
    }).catch(error => {
        if (error.name === 'SequelizeDatabaseError') {
            request.session.error = "Incorrect message.";
            response.redirect('/');
        } else {
            console.error(error);
            response.status(503).end('Service Unavailable');
        }
    });
});

server.post('/message/:id/delete', (request, response) => {
    if (!request.session.authorized) {
        response.status(401).end('Unauthorized');
        return;
    }

    const id = request.params.id;
    if (!id) {
        request.session.error = "The message to be deleted was not specified.";
        response.redirect('/');
        return;
    }

    Message.findOne({ 'where': { id } }).then(message => {
        if (!message) {
            request.session.error = "No message to delete.";
            response.redirect('/');
        } else if (!(request.session.administrator || request.session.userID === message.userId)) {
            response.status(401).end('Unauthorized');
        } else {
            return message.destroy().then(() => {
                response.redirect('/');
            });
        }
    }).catch(error => {
        console.error(error);
        response.status(503).end('Service Unavailable');
    });
});

server.get('/message/:id/edit', (request, response) => {
    if (!request.session.authorized) {
        response.status(401).end('Unauthorized');
        return;
    }

    const id = request.params.id;
    if (!id) {
        request.session.error = "The message to be edited was not specified.";
        response.redirect('/');
        return;
    }

    Message.findOne({ 'where': { id } }).then(message => {
        if (!message) {
            request.session.error = "No message to edit.";
            response.redirect('/');
        } else if (!(request.session.administrator || request.session.userID === message.userId)) {
            response.status(401).end('Unauthorized');
        } else {
            response.render('message-edit', { message, 'session': request.session });
        }
    }).catch(error => {
        console.error(error);
        response.status(503).end('Service Unavailable');
    });
});

server.post('/message/:id/edit', (request, response) => {
    if (!request.session.authorized) {
        response.status(401).end('Unauthorized');
        return;
    }

    const id = request.params.id;
    if (!id) {
        request.session.error = "The message to be edited was not specified.";
        response.redirect('/');
        return;
    }

    const content = request.body.content;
    if (!content) {
        request.session.error = "The message can't be empty.";
        response.redirect(`/message/${parseInt(id)}/edit`);
        return;
    }

    Message.findOne({ 'where': { id } }).then(message => {
        if (!message) {
            request.session.error = "No message to edit.";
            response.redirect('/');
        } else if (!(request.session.administrator || request.session.userID === message.userId)) {
            response.status(401).end('Unauthorized');
        } else {
            return message.update({ content }).then(() => {
                response.redirect('/');
            });
        }
    }).catch(error => {
        if (error.name === 'SequelizeDatabaseError') {
            request.session.error = "Incorrect message.";
            response.redirect(`/message/${parseInt(id)}/edit`);
        } else {
            console.error(error);
            response.status(503).end('Service Unavailable');
        }
    });
});

(function loop(){
    setTimeout(async () => {
        try {
            await sequelize.sync();
            const hashedPass = bcrypt.hashSync(
                process.env.ADMIN_PASS,
                bcrypt.genSaltSync(8)
            );
            await User.upsert({
                'login': 'admin',
                'password': hashedPass,
                'administrator': true
            });
            server.listen(port, () => {
                console.log(`Project Fidonet2020 server is listening on port ${port}.`);
            });
        } catch (error) {
            console.error(error);
            console.error("Failed to connect. Trying again...");

            loop();
        }
    }, dbReconnectTimeout || 2000);
})();
