# Travel Guide (Vanilla)

This repository contains a small, framework-free travel guide example built with vanilla HTML, CSS and JavaScript. It includes sample destination data in both JS and JSON formats.

Files created:

- /index.html
- /css/reset.css
- /css/styles.css
- /js/main.js
- /js/destinations.js
- /pages/destination.html
- /pages/about.html
- /data/destinations.json

Quick start (open locally):

1. Serve the folder with a static server (recommended) — for example, using `npx http-server` or Python:

```bash
# with http-server (install once):
npx http-server . -c-1

# or with Python 3:
python3 -m http.server 3000
```

2. Open http://localhost:3000/index.html in your browser.

Next steps — migrate to Next.js + MongoDB
--------------------------------------

You asked to use Next.js for frontend and backend with MongoDB. This repo keeps a vanilla baseline and includes guidance to migrate. Suggested Next.js structure:

- /next-app
  - /pages
    - index.js (renders homepage)
    - /destinations/[id].js (destination page)
    - /api
      - destinations.js (API route that talks to MongoDB)
  - /public (static assets)
  - /styles (global and component styles)
  - /lib
    - mongodb.js (Mongo client helper)

Example commands to create the Next.js app and install MongoDB driver:

```bash
npx create-next-app@latest next-app
cd next-app
npm install mongodb
```

Minimal MongoDB helper (`/lib/mongodb.js`):

```js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) throw new Error('Add MONGODB_URI to .env.local');

client = new MongoClient(uri, options);
clientPromise = client.connect();

export default clientPromise;
```

Example API route (`/pages/api/destinations.js`):

```js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('travel');
  const data = await db.collection('destinations').find({}).toArray();
  res.json(data);
}
```

Notes:
- Keep `data/destinations.json` as seed data to import into MongoDB during setup.
- Add `.env.local` with `MONGODB_URI` to connect to your database.

If you want, I can scaffold a Next.js app under `next-app/` in this workspace (pages, api, and seed import script). Tell me if you want me to create that now.
