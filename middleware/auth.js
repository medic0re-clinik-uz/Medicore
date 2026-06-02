
const store = require('../data/store');


const sessions = new Map();


const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Login va parol kiritilishi shart" });
  }

  const user = store.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
  }

  
  const token = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessions.set(token, { ...user });

  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, title: user.title, username: user.username }
  });
};


const logout = (req, res) => {
  const token = req.headers['authorization'];
  if (token) sessions.delete(token);
  res.json({ message: "Tizimdan chiqildi" });
};


const protect = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: "Token kerak" });

  const user = sessions.get(token);
  if (!user) return res.status(401).json({ error: "Token yaroqsiz yoki muddati o'tgan" });

  req.user = user;
  next();
};


const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Bu amalni bajarishga ruxsatingiz yo'q" });
  }
  next();
};

module.exports = { login, logout, protect, allowRoles };