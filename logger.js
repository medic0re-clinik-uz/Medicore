
const logger = (req, res, next) => {
  const time = new Date().toLocaleTimeString('uz-UZ');
  console.log(`[${time}] ${req.method} ${req.path}`);
  next();
};

module.exports = logger;