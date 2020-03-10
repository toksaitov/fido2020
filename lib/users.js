import bcrypt from 'bcryptjs';

function users(parameters, server, database) {
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

        const User = database.models.User;
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

        const User = database.models.User;
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
}

export default users;
