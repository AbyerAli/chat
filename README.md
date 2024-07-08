## React + node based live chat app

### To start
1. Clone the repo
2. Run `yarn` on both `server` and `client` folders
3. Run `yarn run dev` on both `server` and `client` folders
4. Open `http://localhost:5173/` on your browser.


### Features
1. Real-time chat
2. User authentication

### Tech stack
1. React
2. Node
3. Express
4. Socket.io
5. Cassandra


### working
- User can login with their username and password `or` signup with their username and password
- upon login, user has to  select  a room to chat to do that select a room and press `join room`
- user can chat with other users in the same room
- DB is deployed on Astra Cassandra, the credentials are in the `/server/database` folder
- upon starting the server the 2 logs should appear in the console to confirm that server has started successfully
  - `Server started on port 3005`
  - `Connected to Cassandra`
- styling  is done with `tailwind` with some custom `css`
- starts with `/api/v1/`:
  - `/register` and `/login` are in auth controller
  - `/messages` is in messages controller 

- Registration process is conditionally rendered at client