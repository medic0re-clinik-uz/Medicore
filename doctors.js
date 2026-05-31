
const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { protect, allowRoles } = require('../middleware/auth');

const ADMIN = ['admin'];
const ALL   = ['admin', 'clinician', 'receptionist'];


router.get('/', protect, async (req, res) => {
  const { q } = req.query;
  let list = store.doctors;
  if (q) {
    const query = q.toLowerCase();
    list = list.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.specialty.toLowerCase().includes(query) ||
      d.department.toLowerCase().includes(query)
    );
  }
  res.json(list);
});


router.get('/:id', protect, async (req, res) => {
  const doc = store.doctors.find(d => d.id === +req.params.id);
  if (!doc) return res.status(404).json({ error: "Shifokor topilmadi" });
  res.json(doc);
});


router.post('/', protect, allowRoles(...ADMIN), async (req, res) => {
  const { name, specialty, department, phone, email, experience, status } = req.body;
  if (!name || !specialty || !department) {
    return res.status(400).json({ error: "Ism, mutaxassislik va bo'lim majburiy" });
  }
  const doc = {
    id: store.getNextId('doctors'),
    name, specialty, department,
    phone: phone || '',
    email: email || '',
    experience: Number(experience) || 0,
    status: status || 'Faol'
  };
  store.doctors.push(doc);
  res.status(201).json(doc);
});


router.put('/:id', protect, allowRoles(...ADMIN), async (req, res) => {
  const idx = store.doctors.findIndex(d => d.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Shifokor topilmadi" });
  store.doctors[idx] = { ...store.doctors[idx], ...req.body, id: +req.params.id };
  res.json(store.doctors[idx]);
});


router.delete('/:id', protect, allowRoles(...ADMIN), async (req, res) => {
  const idx = store.doctors.findIndex(d => d.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Shifokor topilmadi" });
  store.doctors.splice(idx, 1);
  res.json({ message: "Shifokor o'chirildi" });
});

module.exports = router;