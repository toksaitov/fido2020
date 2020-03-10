function messages(parameters, server, database) {
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

        const Message = database.models.Message;
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

        const Message = database.models.Message;
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

        const Message = database.models.Message;
        Message.findOne({ 'where': { id } }).then(message => {
            if (!message) {
                request.session.error = "No message to edit.";
                response.redirect('/');
            } else if (!(request.session.administrator || request.session.userID === message.userId)) {
                response.status(401).end('Unauthorized');
            } else {
                response.render('editMessage', { message, 'session': request.session });
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

        const Message = database.models.Message;
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
}

export default messages;
