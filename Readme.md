fidonet2020
===========

Project codenamed __fidonet2020__ is a simple Twitter clone.

## Requirements

* Node.js (>= 13) with npm or yarn
* MySQL (>= 5.7)

## Deployment Manually

Create an `.env` file with the following secrets and parameters.

```
# Server Parameter

PORT=8080                 # specify the server port (defaults to 8080)
SESSION_SECRET=           # specify the session secret to use with cookies (required)
ADMIN_LOGIN=              # specify the administrator's login (required)
ADMIN_PASS=               # specify the administrator's password (required)

# Database Parameters

DB_NAME=fido2020_db       # specify the database name (defaults to fido2020_db)
DB_USER=fido2020_db_user  # specify the name of a database user (defaults to fido2020_db_user)
DB_PASS=                  # specify the password to access the database (required)
DB_HOST=localhost         # specify the database host (defaults to localhost)
DB_PORT=3306              # specify the database port (defaults to 3306)
DB_DIALECT=mysql          # select the database dialect (mysql (default), mariadb, sqlite, postgresql, mssql)
DB_RECONNECT_TIMEOUT=2000 # time between db reconnection attempts (defaults to 2000)
DB_SESS_HOST=localhost    # specify the session database host (defaults to localhost)
```

Download libraries with `npm install` and start the server with `npm start`.

## Deployment through Docker

1. Install Docker and Docker Compose.
2. Create an `.env` file as described in 'Manual Deployment'.
3. Start the database container and the fidonet2020 container with `docker-compose up`.

## Credits

Dmitrii Toksaitov <dmitrii@toksaitov.com>
