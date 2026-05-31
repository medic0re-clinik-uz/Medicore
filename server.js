const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const path    = require('path');

const logger     = require('./middleware/logger');
const { login, logout } = require('./middleware/auth');
const doctorsRouter  = require('./routes/doctors');
const patientsRouter = require('./routes/patients');
const diseasesRouter = require('./routes/diseases');
const statsRouter    = require('./routes/stats');

const app  = express();
const PORT = process.env.PORT || 3000;


app.use(helmet({ contentSecurityPolicy: false })); 
app.use(cors());                                   
app.use(morgan('dev'));                             
app.use(express.json());                           
app.use(express.urlencoded({ extended: true }));   
app.use(logger);                                   
app.use(express.static(path.join(__dirname, 'public'))); 


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { error: "Juda ko'p so'rov. Biroz kuting." }
});
app.use('/api', limiter);


app.post('/api/auth/login',  login);
app.post('/api/auth/logout', logout);

app.use('/api/doctors',  doctorsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/diseases', diseasesRouter);
app.use('/api/stats',    statsRouter);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use((err, req, res, next) => {
  console.error('Xato:', err.message);
  res.status(500).json({ error: "Server xatosi yuz berdi" });
});


const server = app.listen(PORT, () => {
  console.log(`\n🏥 MediCore TYBT serveri ishga tushdi`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`\nTest loginlar:`);
  console.log(`  admin     / Admin@2024  (Administrator)`);
  console.log(`  doctor1   / Doc@1234   (Klinitsist)`);
  console.log(`  reception / Rec@5678   (Qabulxona)\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} allaqachon band. Iltimos, boshqa protsessni to'xtating yoki PORT muhit o'zgaruvchisidan foydalaning.`);
  } else {
    console.error('Server xatosi:', err);
  }
  process.exit(1);
});