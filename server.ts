import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Mock Database in memory
  let users: any[] = [];
  let currentUser: any = null;

  app.post("/api/register", (req, res) => {
    const { username, password, email, avatarBase64 } = req.body;
    if (users.find(u => u.username === username)) {
      return res.json({ success: false, message: "Username sudah terdaftar" });
    }
    const newUser = { id: users.length + 1, username, email, avatar: avatarBase64 };
    users.push({ ...newUser, password }); 
    res.json({ success: true, message: "Registrasi berhasil!" });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.json({ success: false, message: "Kredensial salah" });
    }
    const { password: _, ...userData } = user;
    currentUser = userData;
    res.json({ success: true, message: "Login berhasil", userData });
  });

  app.get("/api/current-user", (req, res) => {
    res.json(currentUser);
  });

  app.post("/api/logout", (req, res) => {
    currentUser = null;
    res.json({ success: true });
  });

  // Mock Database for features
  let todos: any[] = [];
  let journals: any[] = [];
  let schedules: any[] = [];

  app.get("/api/todos", (req, res) => res.json(todos));
  app.post("/api/todos", (req, res) => {
    const { content } = req.body;
    todos.push({ id: todos.length + 1, content, completed: false });
    res.json({ success: true });
  });
  app.post("/api/todos/toggle", (req, res) => {
    const { id, completed } = req.body;
    todos = todos.map(t => t.id === id ? { ...t, completed } : t);
    res.json({ success: true });
  });
  app.post("/api/todos/delete", (req, res) => {
    const { id } = req.body;
    todos = todos.filter(t => t.id !== id);
    res.json({ success: true });
  });

  app.get("/api/journals", (req, res) => res.json(journals));
  app.post("/api/journals", (req, res) => {
    const { title, content, id } = req.body;
    if (id) {
      journals = journals.map(j => j.id === id ? { ...j, title, content } : j);
    } else {
      journals.push({ id: journals.length + 1, title, content, createdAt: new Date().toISOString() });
    }
    res.json({ success: true });
  });

  app.get("/api/schedules", (req, res) => res.json(schedules));
  app.post("/api/schedules", (req, res) => {
    const { event, date, time } = req.body;
    schedules.push({ id: schedules.length + 1, event, date, time });
    res.json({ success: true });
  });
  app.post("/api/schedules/delete", (req, res) => {
    const { id } = req.body;
    schedules = schedules.filter(s => s.id !== id);
    res.json({ success: true });
  });

  app.get("/api/dashboard", (req, res) => {
    // ... existing data
    res.json({
      schedules: [
        { time: "08:00", event: "Sync with Terminal" },
        { time: "10:30", event: "System Diagnostic" },
        { time: "14:00", event: "Neural Link Calibration" },
      ],
      achievements: [
        { title: "Overload Protocol", progress: 85 },
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
