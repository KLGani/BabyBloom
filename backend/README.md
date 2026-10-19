# Backend setup

1. Copy `.env.example` to `.env.local`. This file is ignored by Git.
2. In MongoDB Atlas, create a database user, allow your server's IP address in
   Network Access, and copy the application's connection string into `MONGO_URI`.
   Replace the username, password, and cluster host in the example URI. Do not
   commit the real connection string.
3. Set `JWT_SECRET` to a long, random value and keep it unchanged between server
   restarts. A changed secret invalidates existing login tokens.
4. Start the API with `npm install` followed by `npm run dev`.

Users and password hashes are stored in the MongoDB database selected by
`MONGO_URI`, so they remain available after the API server restarts. The
frontend uses the active Expo host (or the browser's host) by default. Set
`EXPO_PUBLIC_API_URL` only when the API is hosted at a different address; use a
LAN-reachable address for a physical device.
