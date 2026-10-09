# DeadlineSOS

DeadlineSOS is a React + Node.js academic planning application.

## UI redesign

The application structure and functionality have been preserved. The visual layer has been redesigned with a lighter professional system:

- Light neutral page surfaces
- White elevated cards and panels
- Blue/indigo primary actions
- Softer semantic status colors
- Accessible text contrast
- Cleaner borders, shadows and spacing
- Responsive layouts preserved
- Existing routes, API calls and component responsibilities preserved

## Project structure

```text
Sejuti/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   └── package.json
├── package.json
└── .gitignore
```

## Setup

Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Configure `server/.env` using `server/.env.example`, then start the application with:

```bash
npm run dev
```

The production frontend build can be generated with:

```bash
npm run build
```
