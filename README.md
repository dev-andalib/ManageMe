# ManageMe — a Trello-style Kanban app (MERN)

![Node](https://img.shields.io/badge/Node.js-18+-brightgreen) ![Express](https://img.shields.io/badge/Express-4.x-black) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-success) ![Mongoose](https://img.shields.io/badge/Mongoose-ODM-red) ![License](https://img.shields.io/badge/License-MIT-lightgrey)

A lightweight, modern Kanban tool built with the MERN stack. Manage work with Workspaces → Boards → Lists → Cards, plus checklists, labels, due dates, attachments, comments, and fast search. Collaboration is intentionally out of scope for the MVP.

---

## ✨ Features (MVP)

1. **Workspaces** – create & browse workspaces; each shows a live **board count**.
2. **Boards** – popup form to create boards; assign a board to one or more workspaces.
3. **Lists** – add lists inside a board (e.g., To-Do / Doing / Done), reorder with drag-and-drop.
4. **Cards** – add/edit/move cards between lists.
5. **Checklists** – subtasks with progress.
6. **Labels** – color tags for quick visual categorization.
7. **Due dates** – calendar picker + overdue highlighting.
8. **Attachments** – upload files to a card (local in dev; pluggable storage).
9. **Comments & Activity** – threaded comments + concise activity log per card.
10. **Notifications (optional)** – in-app toast updates (Socket.IO ready).
11. **Search & Filter** – instant search across cards; filter by label/due date/status.

Extras:

* **Profile page** – view/update basic user info; “Back” returns to *My Workspaces*.
* **Persistent storage** – boards/lists/cards survive refresh & navigation (MongoDB Atlas).

---

## 🧱 Tech Stack

* **Frontend:** React + Vite, React Router, Zustand/Context (state), dnd-kit for drag-and-drop, Axios.
* **Backend:** Node.js, **Express**, **Mongoose**.
* **Database:** **MongoDB Atlas**.
* **Realtime (optional):** Socket.IO.
* **Uploads:** Multer (dev) with an easy switch to Cloudinary/S3 in prod.

---

## 🚀 Quick Start

### 1) Clone & install

```bash
git clone https://github.com/your-username/manageme.git
cd manageme
# server deps
cd server && npm i
# client deps
cd ../client && npm i
```

### 2) Environment variables

**/server/.env**

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/ManageMe?retryWrites=true&w=majority
JWT_SECRET=dev_secret_change_me
CLIENT_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
```

**/client/.env**

```env
VITE_API_URL=http://localhost:5000/api
```

> Using Atlas for the first time? In Atlas → *Network Access*, allow your IP (or `0.0.0.0/0` for testing). In *Database Access*, create a user with `readWrite` on your DB.

### 3) Run dev servers

Open two terminals:

**Server**

```bash
cd server
npm run dev   # nodemon
```

**Client**

```bash
cd client
npm run dev   # Vite at http://localhost:5173
```

---

## 📁 Project Structure

```
manageme/
  server/
    src/
      models/        # Mongoose schemas
      routes/        # Express routers (workspaces, boards, lists, cards, comments, files)
      controllers/   # Business logic
      middleware/    # errorHandler, auth, uploads
      utils/         # helpers (pagination, sockets, etc.)
      app.js         # Express app
      db.js          # Mongo connection
      socket.js      # (optional) Socket.IO setup
    package.json
  client/
    src/
      pages/         # Workspaces, Boards, BoardDetail, Profile
      components/    # UI pieces (BoardCard, List, Card, Checklist, Label, etc.)
      store/         # Zustand/Context
      api/           # Axios clients
    package.json
  README.md
```

---

## 🗄️ Data Models (simplified)

```js
// Workspace
{ name: String, description: String, boardIds: [ObjectId] }

// Board
{ title: String, description: String, workspaceIds: [ObjectId], listIds: [ObjectId] }

// List
{ boardId: ObjectId, title: String, position: Number, cardIds: [ObjectId] }

// Card
{
  listId: ObjectId,
  title: String,
  description: String,
  labels: [{ name:String, color:String }],
  dueDate: Date,
  checklist: [{ _id:false, text:String, done:Boolean }],
  attachments: [{ filename:String, url:String, size:Number }],
  activity: [{ type:String, message:String, at:Date }],
}

// Comment
{ cardId: ObjectId, text: String, createdAt: Date }

// User (basic for profile)
{ name:String, email:String, avatarUrl:String }
```

---

## 🔌 REST API (high level)

```
POST   /api/workspaces           # create workspace
GET    /api/workspaces           # list workspaces (+board counts)
GET    /api/workspaces/:id/boards

POST   /api/boards               # create board (assign workspaceIds)
GET    /api/boards/:id           # board detail with lists/cards

POST   /api/lists                # create list
PATCH  /api/lists/:id/reorder    # drag & drop ordering

POST   /api/cards                # create card
PATCH  /api/cards/:id            # update (labels, dueDate, etc.)
POST   /api/cards/:id/comments
POST   /api/cards/:id/attachments  # Multer upload

GET    /api/search?q=...         # cross-board search
```

---

## 🧭 UX Notes

* **Boards page shows “Your Workspaces”** (not a raw board dump).
* Clicking a **Workspace** opens its **board collection**; the **count increases** when a board is added.
* **Back from Profile** returns to *My Workspaces / boards.jsx*.
* Opening a **Board** reveals **Lists** with an “Add List” control and card creation inside each list.

---

## 🧪 Scripts

**server/package.json**

```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "lint": "eslint ."
  }
}
```

**client/package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🛡️ Security & Production Tips

* Never commit `.env`; use environment vars on your host (Render/Heroku/Vercel serverless for API).
* Switch file storage to **Cloudinary** or **S3**; keep only secure URLs in MongoDB.
* Add rate limiting & CORS allowlist on the API.
* Enable MongoDB Atlas **Project IP Access List** and user-scoped credentials.

---

## 🧰 Troubleshooting

* **“Cannot find module '.../server.js'”** → ensure your entry file exists (e.g., `src/app.js`) and your `npm run dev` points to it.
* **Atlas connect errors** → check `MONGODB_URI`, IP allowlist, and username/password; use the full `mongodb+srv://` string.
* **Uploads fail** → verify `UPLOAD_DIR` exists and API route uses Multer; for cloud, confirm credentials & allowed formats.

---

## 🗺️ Roadmap

* Real-time board updates via Socket.IO
* Board/Workspace sharing & roles (post-MVP, re-adding collaboration)
* Public/Template boards
* Keyboard shortcuts & bulk actions
* Mobile-friendly drag-and-drop polish

---

## 🤝 Contributing

PRs welcome! Please open an issue to discuss feature ideas or bugs.

---

## 📄 License

MIT © You

---

## 📷 Screenshots

> Place images under `docs/screenshots/` and reference them here:

* Workspaces grid
* Board view (lists + cards)
* Card modal with checklist/labels/attachments
* Search results overlay

---

Need me to tailor this README to your exact folder names, scripts, or current API routes? Paste your repo structure and I’ll align everything precisely.




















<!--

Here’s the updated list of Trello features:

1. **Boards**: Create boards for different projects or tasks, allowing you to organize work visually.
2. **Lists**: Organize tasks into columns to track the progress, such as To-Do, In Progress, and Done.
3. **Cards**: Add detailed tasks within lists, which can be moved around, assigned, and customized.
4. **Checklists**: Add checklists within cards to break tasks down into smaller steps.
5. **Labels**: Use color-coded labels to categorize and prioritize tasks easily.
6. **Due Dates**: Set due dates and deadlines for tasks to keep track of project timelines.
7. **Attachments**: Attach files, images, and links to cards for easy access to relevant materials.
8. **Power-Ups**: Integrate with other apps and services (like Google Drive, Slack, and Zapier) to extend Trello's functionality.
9. **Collaboration**: Add members to boards and cards to collaborate with your team.
10. **Notifications**: Receive notifications when changes occur, ensuring you're up to date.
11. **Comments**: Leave comments on cards for team discussions and feedback.
12. **Search & Filter**: Find cards quickly using the search function and apply filters to view only the most relevant tasks.
-->
