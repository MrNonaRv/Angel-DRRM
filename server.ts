import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mambusao_drrm.db");

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    quantity INTEGER,
    unit TEXT,
    source TEXT,
    condition TEXT,
    location TEXT,
    lastInspectionDate TEXT,
    remarks TEXT
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    genericName TEXT,
    brandName TEXT,
    dosage TEXT,
    form TEXT,
    quantity INTEGER,
    unit TEXT,
    expiryDate TEXT,
    supplier TEXT,
    storage TEXT,
    lotNumber TEXT,
    lastStockCount INTEGER,
    remarks TEXT
  );

  CREATE TABLE IF NOT EXISTS kits (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT,
    responsiblePerson TEXT,
    condition TEXT,
    lastCheckedDate TEXT,
    contents TEXT
  );

  CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    borrowerName TEXT,
    borrowerContact TEXT,
    dateBorrowed TEXT,
    dateReturned TEXT,
    releasingOfficer TEXT,
    receivingOfficer TEXT,
    purpose TEXT,
    status TEXT,
    items TEXT
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    designation TEXT,
    badge TEXT,
    username TEXT DEFAULT 'admin',
    password TEXT DEFAULT 'mambusao2026'
  );

  CREATE INDEX IF NOT EXISTS idx_equipment_condition ON equipment(condition);
  CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiryDate);
  CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
  CREATE INDEX IF NOT EXISTS idx_logs_borrower ON logs(borrowerName);
`);

// Data Migration: Convert Hiligaynon/Tagalog/Old constants to English
try {
  db.prepare("UPDATE equipment SET condition = 'Very Good Condition' WHERE condition IN ('MAAYO', 'VERY_GOOD')").run();
  db.prepare("UPDATE equipment SET condition = 'Good Condition' WHERE condition IN ('MAAYO_PA', 'GOOD', 'DILI_MAAYO')").run();
  db.prepare("UPDATE logs SET status = 'Returned' WHERE status IN ('GIBALIK', 'RETURNED')").run();
  db.prepare("UPDATE logs SET status = 'Borrowed' WHERE status = 'GINHULAM'").run();
} catch (e) {
  console.log("Migration skipped or failed:", e.message);
}

// Seed initial profile if not exists
const profileExists = db.prepare("SELECT count(*) as count FROM profile").get() as { count: number };
if (profileExists.count === 0) {
  db.prepare("INSERT INTO profile (id, name, designation, badge, username, password) VALUES (1, 'Admin User', 'DRRM Personnel', 'ADM', 'admin', 'mambusao2026')").run();
}

// Seed initial equipment if not exists
const equipmentExists = db.prepare("SELECT count(*) as count FROM equipment").get() as { count: number };
if (equipmentExists.count === 0) {
  // Database starts empty
}

// Seed initial medicines if not exists
const medsExists = db.prepare("SELECT count(*) as count FROM medicines").get() as { count: number };
if (medsExists.count === 0) {
  // Database starts empty
}

// Seed initial kits if not exists
const kitsExists = db.prepare("SELECT count(*) as count FROM kits").get() as { count: number };
if (kitsExists.count === 0) {
  // Database starts empty
}

// Seed initial logs if not exists
const logsExists = db.prepare("SELECT count(*) as count FROM logs").get() as { count: number };
if (logsExists.count === 0) {
  // Database starts empty
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Standardized error response helper
const handleApiError = (res: express.Response, error: any, message = "Internal Server Error") => {
  console.error(`[API ERROR] ${message}:`, error);
  res.status(500).json({ error: message, details: error.message });
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/equipment", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM equipment ORDER BY name ASC").all();
    res.json(data);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch equipment");
  }
});

app.post("/api/equipment", (req, res) => {
  try {
    const item = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO equipment (id, name, description, quantity, unit, source, condition, location, lastInspectionDate, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(item.id, item.name, item.description, item.quantity, item.unit, item.source, item.condition, item.location, item.lastInspectionDate, item.remarks);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to save equipment");
  }
});

app.delete("/api/equipment/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM equipment WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to delete equipment");
  }
});

app.get("/api/medicines", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM medicines ORDER BY genericName ASC").all();
    res.json(data);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch medicines");
  }
});

app.post("/api/medicines", (req, res) => {
  try {
    const item = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO medicines (id, genericName, brandName, dosage, form, quantity, unit, expiryDate, supplier, storage, lotNumber, lastStockCount, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(item.id, item.genericName, item.brandName, item.dosage, item.form, item.quantity, item.unit, item.expiryDate, item.supplier, item.storage, item.lotNumber, item.lastStockCount, item.remarks);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to save medicine");
  }
});

app.delete("/api/medicines/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM medicines WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to delete medicine");
  }
});

app.get("/api/kits", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM kits ORDER BY name ASC").all();
    const parsedData = data.map((kit: any) => ({
      ...kit,
      contents: JSON.parse(kit.contents || '[]')
    }));
    res.json(parsedData);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch kits");
  }
});

app.post("/api/kits", (req, res) => {
  try {
    const item = req.body;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO kits (id, name, location, responsiblePerson, condition, lastCheckedDate, contents)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(item.id, item.name, item.location, item.responsiblePerson, item.condition, item.lastCheckedDate, JSON.stringify(item.contents));
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to save kit");
  }
});

app.delete("/api/kits/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM kits WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to delete kit");
  }
});

app.get("/api/logs", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM logs ORDER BY dateBorrowed DESC").all();
    const parsedData = data.map((log: any) => ({
      ...log,
      items: JSON.parse(log.items)
    }));
    res.json(parsedData);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch logs");
  }
});

app.post("/api/logs", (req, res) => {
  const log = req.body;
  const transaction = db.transaction((logData) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO logs (id, borrowerName, borrowerContact, dateBorrowed, dateReturned, releasingOfficer, receivingOfficer, purpose, status, items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(logData.id, logData.borrowerName, logData.borrowerContact, logData.dateBorrowed, logData.dateReturned, logData.releasingOfficer, logData.receivingOfficer, logData.purpose, logData.status, JSON.stringify(logData.items));

    // Update equipment quantities if status is BORROWED
    if (logData.status === 'BORROWED') {
      for (const item of logData.items) {
        db.prepare("UPDATE equipment SET quantity = quantity - ? WHERE id = ?").run(item.qty, item.itemId);
      }
    }
  });

  try {
    transaction(log);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to process log");
  }
});

app.delete("/api/logs/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM logs WHERE id = ?").run(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to delete log");
  }
});

app.patch("/api/logs/:id/return", (req, res) => {
  const { dateReturned, receivingOfficer, status, items } = req.body;
  const transaction = db.transaction((data) => {
    db.prepare("UPDATE logs SET dateReturned = ?, receivingOfficer = ?, status = ? WHERE id = ?")
      .run(data.dateReturned, data.receivingOfficer, data.status, req.params.id);

    // Update equipment quantities back
    if (data.items) {
      for (const item of data.items) {
        db.prepare("UPDATE equipment SET quantity = quantity + ? WHERE id = ?").run(item.qty, item.itemId);
      }
    }
  });

  try {
    transaction({ dateReturned, receivingOfficer, status, items });
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to return items");
  }
});

app.get("/api/profile", (req, res) => {
  try {
    const data = db.prepare("SELECT * FROM profile WHERE id = 1").get();
    res.json(data);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch profile");
  }
});

app.post("/api/profile", (req, res) => {
  try {
    const profile = req.body;
    db.prepare("UPDATE profile SET name = ?, designation = ?, badge = ?, username = ?, password = ? WHERE id = 1")
      .run(profile.name, profile.designation, profile.badge, profile.username, profile.password);
    res.json({ status: "ok" });
  } catch (error) {
    handleApiError(res, error, "Failed to update profile");
  }
});

app.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get() as any;
    
    if (profile && profile.username === username && profile.password === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    handleApiError(res, error, "Login failed");
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Automatically open the browser
    const url = `http://localhost:${PORT}`;
    const platform = os.platform();
    let cmd = '';
    if (platform === 'win32') {
      cmd = `start "" "${url}"`;
    } else if (platform === 'darwin') {
      cmd = `open "${url}"`;
    } else {
      cmd = `xdg-open "${url}"`;
    }
    exec(cmd, () => {});
  });
}

startServer();
