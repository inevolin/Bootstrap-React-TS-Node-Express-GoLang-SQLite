# Bootstrap front- and backend

 A bootstrap template and example for code for a front- and backend server.

 This solution uses React/Typescript for frontend + Jest/Supertest + NodeJS/Express/Typescript for backend (or Go/Gin) + SQLite data store. 

 Note: this repo comes with auto-linting and formatting (if you use VSCode) to enforce best-practice standards.

## Back-end (NodeJS)
Quick start:

 ```
 cd back/
 yarn
 yarn start # start server (with ts-node)
 yarn watch # start server in dev mode
 # TODO: build code with tsc or other compiler
 ```

## Back-end (GoLang)
Quick start:

 ```
 cd backgo/
 go install
 go run .
 ```

Hint: server port 3000 used by default

 ## Front-end
Quick start:

 ```
 cd front/
 yarn
 yarn react-scripts build # build server
 yarn react-scripts start # start server
 yarn test # run unit tests
 ```

Hint: if you build the server, you don't need to start it here, the back-end will serve it.

Hint: login email and password are both `admin`
