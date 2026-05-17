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
  let routines: any[] = [];
  let journals: any[] = [];
  let sketches: any[] = [];
  let schedules: any[] = [];

  app.post("/api/login/guest", (req, res) => {
    const guestUser = { id: 999, username: "GUEST_ALPHA", email: "guest@local.core", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guest", password: "guest" };
    if (!users.find(u => u.id === 999)) {
      users.push(guestUser);
    }
    const { password: _, ...userData } = guestUser;
    currentUser = userData;
    res.json({ success: true, message: "Logged in as Guest", userData: currentUser });
  });

  app.get("/api/todos", (req, res) => res.json(todos));
  app.post("/api/todos", (req, res) => {
    const { content } = req.body;
    todos.push({ id: todos.length + 1, content, completed: false, completedAt: null });
    res.json({ success: true });
  });
  app.post("/api/todos/toggle", (req, res) => {
    const { id, completed } = req.body;
    todos = todos.map(t => t.id === id ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t);
    res.json({ success: true });
  });
  app.post("/api/todos/delete", (req, res) => {
    const { id } = req.body;
    todos = todos.filter(t => t.id !== id);
    res.json({ success: true });
  });

  app.get("/api/routines", (req, res) => res.json(routines));
  app.post("/api/routines", (req, res) => {
    const { content, time, endDate, color } = req.body;
    routines.push({ id: routines.length + 1, content, time, endDate, color, completed: false });
    res.json({ success: true });
  });
  app.post("/api/routines/toggle", (req, res) => {
    const { id, completed } = req.body;
    routines = routines.map(r => r.id === id ? { ...r, completed } : r);
    res.json({ success: true });
  });
  app.post("/api/routines/delete", (req, res) => {
    const { id } = req.body;
    routines = routines.filter(r => r.id !== id);
    res.json({ success: true });
  });

  app.get("/api/journals", (req, res) => res.json(journals));
  app.get("/api/journals/:id", (req, res) => {
    const journal = journals.find(j => j.id === parseInt(req.params.id));
    res.json(journal);
  });
  app.post("/api/journals", (req, res) => {
    const { title, content, id, fontFamily, fontSize, spacing, fontColor, paperColor, paragraphAlign, showLines } = req.body;
    if (id) {
      journals = journals.map(j => j.id === id ? { ...j, title, content, fontFamily, fontSize, spacing, fontColor, paperColor, paragraphAlign, showLines } : j);
    } else {
      journals.push({ 
          id: journals.length + 1, 
          title, 
          content, 
          fontFamily, 
          fontSize, 
          spacing, 
          fontColor, 
          paperColor, 
          paragraphAlign,
          showLines, 
          createdAt: new Date().toISOString() 
      });
    }
    res.json({ success: true });
  });
  app.post("/api/journals/save-detailed", (req, res) => {
    const { id, title, content, fontSize, fontFamily, spacing, paragraph, fontColor, paperStyle } = req.body;
    if (id) {
      journals = journals.map(j => j.id === id ? { ...j, title, content, fontSize, fontFamily, spacing, paragraph, fontColor, paperStyle } : j);
    } else {
      journals.push({ id: journals.length + 1, title, content, fontSize, fontFamily, spacing, paragraph, fontColor, paperStyle, createdAt: new Date().toISOString() });
    }
    res.json({ success: true });
  });

  app.get("/api/sketches", (req, res) => res.json(sketches));
  app.post("/api/sketches", (req, res) => {
    const { data } = req.body;
    sketches.push({ id: sketches.length + 1, data, createdAt: new Date().toISOString() });
    res.json({ success: true });
  });

  app.get("/api/activity/stats", (req, res) => {
    const monthlyTasks = todos.filter(t => t.completed && t.completedAt && (new Date().getTime() - new Date(t.completedAt).getTime() < 30 * 24 * 60 * 60 * 1000)).length;
    const achievements = routines.map(r => ({
      name: r.content,
      score: r.completed ? 1 : 0,
      endDate: r.endDate
    }));
    res.json({ monthlyTasks, achievements });
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

  app.get("/api/users", (req, res) => {
    // In a real app, we'd query SQLite here. For this demo, we'll return a mock list or proxy to the App if it was Wails.
    // Since we are simulating Wails but running in Express/SQLite context, let's keep it simple.
    res.json([{ id: 1, username: "Aditya", email: "aditya@core.ai", avatar: "" }]);
  });

  app.post("/api/user/update-username", (req, res) => {
    const { username } = req.body;
    if (!currentUser) return res.json({ success: false, message: "Not logged in" });
    
    // Update users array
    users = users.map(u => u.username === currentUser.username ? { ...u, username } : u);
    // Update session
    currentUser.username = username;
    res.json({ success: true, message: "Username updated" });
  });

  app.post("/api/user/update-avatar", (req, res) => {
    const { avatarBase64 } = req.body;
    if (!currentUser) return res.json({ success: false, message: "Not logged in" });
    
    users = users.map(u => u.username === currentUser.username ? { ...u, avatar: avatarBase64 } : u);
    currentUser.avatar = avatarBase64;
    res.json({ success: true, message: "Avatar updated" });
  });

  app.post("/api/user/update-password", (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentUser) return res.json({ success: false, message: "Not logged in" });

    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex === -1) return res.json({ success: false, message: "User not found" });

    if (users[userIndex].password !== currentPassword) {
      return res.json({ success: false, message: "Current password mismatch" });
    }

    users[userIndex].password = newPassword;
    res.json({ success: true, message: "Sequence updated" });
  });

  app.post("/api/user/verify-password", (req, res) => {
    const { password } = req.body;
    if (!currentUser) return res.json({ success: false });
    
    const user = users.find(u => u.username === currentUser.username);
    res.json({ success: user && user.password === password });
  });

  app.post("/api/system/flush", (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/system/diagnostics", (req, res) => {
    res.json({ 
        nodeId: "#NF-7729-AX", 
        timestamp: new Date().toISOString(), 
        status: "SECURE",
        uptime: "148:12:05",
        lastCommit: new Date(Date.now() - 3600000).toISOString()
    });
  });

  app.post("/api/system/vacuum", (req, res) => {
    res.json({ success: true, message: "Local database optimized (VACUUM)" });
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
