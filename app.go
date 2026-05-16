package main

import (
	"context"
	"database/sql"
	"encoding/bcrypt"
	"log"
	"os"

	_ "modernc.org/sqlite" // Menggunakan driver pure-go agar mudah di-build
)

// User represents the user model for authentication
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password,omitempty"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
}

// App struct
type App struct {
	ctx         context.Context
	db          *sql.DB
	currentUser *User
}

// NewApp creates a new App instance
func NewApp() *App {
	return &App{}
}

// Startup is called when the app starts
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.initDB()
}

func (a *App) initDB() {
	// Buat folder storage jika belum ada
	_ = os.MkdirAll("storage/avatars", 0755)

	db, err := sql.Open("sqlite", "./users.db")
	if err != nil {
		log.Fatal(err)
	}
	a.db = db

	// Inisialisasi tabel users
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE,
		password TEXT,
		email TEXT,
		avatar TEXT
	);
	CREATE TABLE IF NOT EXISTS todos (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		content TEXT,
		completed BOOLEAN DEFAULT 0,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
	CREATE TABLE IF NOT EXISTS journals (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		title TEXT,
		content TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);
	CREATE TABLE IF NOT EXISTS schedules (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER,
		event TEXT,
		date TEXT,
		time TEXT,
		FOREIGN KEY(user_id) REFERENCES users(id)
	);`
	_, err = db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

// --- TODO METHODS ---

func (a *App) GetTodos() []map[string]interface{} {
	if a.currentUser == nil {
		return nil
	}
	rows, err := a.db.Query("SELECT id, content, completed FROM todos WHERE user_id = ?", a.currentUser.ID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var todos []map[string]interface{}
	for rows.Next() {
		var id int
		var content string
		var completed bool
		rows.Scan(&id, &content, &completed)
		todos = append(todos, map[string]interface{}{"id": id, "content": content, "completed": completed})
	}
	return todos
}

func (a *App) AddTodo(content string) bool {
	if a.currentUser == nil {
		return false
	}
	_, err := a.db.Exec("INSERT INTO todos (user_id, content) VALUES (?, ?)", a.currentUser.ID, content)
	return err == nil
}

func (a *App) ToggleTodo(id int, completed bool) bool {
	_, err := a.db.Exec("UPDATE todos SET completed = ? WHERE id = ?", completed, id)
	return err == nil
}

func (a *App) DeleteTodo(id int) bool {
	_, err := a.db.Exec("DELETE FROM todos WHERE id = ?", id)
	return err == nil
}

// --- JOURNAL METHODS ---

func (a *App) GetJournals() []map[string]interface{} {
	if a.currentUser == nil {
		return nil
	}
	rows, err := a.db.Query("SELECT id, title, content, created_at FROM journals WHERE user_id = ? ORDER BY created_at DESC", a.currentUser.ID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var id int
		var title, content, createdAt string
		rows.Scan(&id, &title, &content, &createdAt)
		result = append(result, map[string]interface{}{"id": id, "title": title, "content": content, "createdAt": createdAt})
	}
	return result
}

func (a *App) SaveJournal(id int, title, content string) bool {
	if a.currentUser == nil {
		return false
	}
	if id == 0 {
		_, err := a.db.Exec("INSERT INTO journals (user_id, title, content) VALUES (?, ?, ?)", a.currentUser.ID, title, content)
		return err == nil
	}
	_, err := a.db.Exec("UPDATE journals SET title = ?, content = ? WHERE id = ?", title, content, id)
	return err == nil
}

// --- SCHEDULE METHODS ---

func (a *App) GetSchedules() []map[string]interface{} {
	if a.currentUser == nil {
		return nil
	}
	rows, err := a.db.Query("SELECT id, event, date, time FROM schedules WHERE user_id = ?", a.currentUser.ID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var id int
		var event, date, time string
		rows.Scan(&id, &event, &date, &time)
		result = append(result, map[string]interface{}{"id": id, "event": event, "date": date, "time": time})
	}
	return result
}

func (a *App) AddSchedule(event, date, time string) bool {
	if a.currentUser == nil {
		return false
	}
	_, err := a.db.Exec("INSERT INTO schedules (user_id, event, date, time) VALUES (?, ?, ?, ?)", a.currentUser.ID, event, date, time)
	return err == nil
}

func (a *App) DeleteSchedule(id int) bool {
	_, err := a.db.Exec("DELETE FROM schedules WHERE id = ?", id)
	return err == nil
}

// --- USER MANAGEMENT & SETTINGS ---

func (a *App) UpdateUsername(newUsername string) bool {
	if a.currentUser == nil {
		return false
	}
	_, err := a.db.Exec("UPDATE users SET username = ? WHERE id = ?", newUsername, a.currentUser.ID)
	if err == nil {
		a.currentUser.Username = newUsername
		return true
	}
	return false
}

func (a *App) UpdatePassword(currentPassword, newPassword string) (bool, string) {
	if a.currentUser == nil {
		return false, "User not authenticated"
	}

	var hashedPassword string
	err := a.db.QueryRow("SELECT password FROM users WHERE id = ?", a.currentUser.ID).Scan(&hashedPassword)
	if err != nil {
		return false, "User not found"
	}

	// Verify current password
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(currentPassword))
	if err != nil {
		return false, "Current passphrase incorrect"
	}

	// Hash new password
	newHashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return false, "Encoding error"
	}

	_, err = a.db.Exec("UPDATE users SET password = ? WHERE id = ?", string(newHashed), a.currentUser.ID)
	if err != nil {
		return false, "Database sync error"
	}

	return true, "Sequence updated"
}

func (a *App) VerifyPassword(password string) bool {
	if a.currentUser == nil {
		return false
	}
	var hashedPassword string
	err := a.db.QueryRow("SELECT password FROM users WHERE id = ?", a.currentUser.ID).Scan(&hashedPassword)
	if err != nil {
		return false
	}
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func (a *App) GetAllUsers() []User {
	rows, err := a.db.Query("SELECT id, username, email, avatar FROM users")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		rows.Scan(&u.ID, &u.Username, &u.Email, &u.Avatar)
		users = append(users, u)
	}
	return users
}

func (a *App) FlushCache() bool {
	// Simple simulation of purging non-essential state
	return true
}

func (a *App) GetSessionDiagnostics() map[string]interface{} {
	if a.currentUser == nil {
		return nil
	}
	return map[string]interface{}{
		"nodeId":    "#NF-7729-AX",
		"timestamp": "2026-05-16 13:16",
		"status":    "SECURE",
	}
}

// Register a new user
func (a *App) Register(username, password, email, avatarBase64 string) (bool, string) {
	// Validasi sederhana
	if len(password) < 6 {
		return false, "Password minimal 6 karakter"
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return false, "Gagal memproses password"
	}

	query := `INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)`
	_, err = a.db.Exec(query, username, string(hashedPassword), email, avatarBase64)
	if err != nil {
		return false, "Username sudah terdaftar atau database error"
	}

	return true, "Registrasi berhasil! Silahkan login."
}

// Login user
func (a *App) Login(username, password string) (bool, string, *User) {
	var user User
	var hashedPassword string

	query := `SELECT id, username, password, email, avatar FROM users WHERE username = ?`
	row := a.db.QueryRow(query, username)
	err := row.Scan(&user.ID, &user.Username, &hashedPassword, &user.Email, &user.Avatar)

	if err == sql.ErrNoRows {
		return false, "Username tidak ditemukan", nil
	}

	// Cek password
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, "Password salah", nil
	}

	user.Password = "" // Jangan kirim hash ke frontend
	a.currentUser = &user
	return true, "Login berhasil", &user
}

// GetCurrentUser returns the logged-in user
func (a *App) GetCurrentUser() *User {
	return a.currentUser
}

// Logout clears the current session
func (a *App) Logout() {
	a.currentUser = nil
}

// SaveAvatar updates user avatar
func (a *App) SaveAvatar(userID int, base64Data string) (string, error) {
	query := `UPDATE users SET avatar = ? WHERE id = ?`
	_, err := a.db.Exec(query, base64Data, userID)
	if err != nil {
		return "", err
	}
	if a.currentUser != nil && a.currentUser.ID == userID {
		a.currentUser.Avatar = base64Data
	}
	return base64Data, nil
}
