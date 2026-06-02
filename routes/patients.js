
const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { protect, allowRoles } = require('../middleware/auth');

const NO_CLINICIAN_DELETE = ['admin', 'receptionist'];


router.get('/', protect, async (req, res) => {
  const { q, doctorId } = req.query;
  let list = store.patients;

  if (q) {
    const query = q.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.address.toLowerCase().includes(query)
    );
  }
  if (doctorId) {
    list = list.filter(p => p.doctorId === +doctorId);
  }
  res.json(list);
});


router.get('/:id', protect, async (req, res) => {
  const patient = store.patients.find(p => p.id === +req.params.id);
  if (!patient) return res.status(404).json({ error: "Bemor topilmadi" });
  const diseases = store.diseases.filter(d => d.patientId === patient.id);
  const doctor = store.doctors.find(d => d.id === patient.doctorId) || null;
  res.json({ ...patient, diseases, doctor });
});


router.post('/', protect, allowRoles('admin', 'receptionist'), async (req, res) => {
  const { name, dob, gender, phone, address, bloodType, doctorId } = req.body;
  if (!name || !dob) return res.status(400).json({ error: "Ism va tug'ilgan sana majburiy" });
  const patient = {
    id: store.getNextId('patients'),
    name, dob,
    gender: gender || 'Erkak',
    phone: phone || '',
    address: address || '',
    bloodType: bloodType || 'A+',
    doctorId: doctorId ? +doctorId : null,
    registeredAt: new Date().toISOString().slice(0, 10)
  };
  store.patients.push(patient);
  res.status(201).json(patient);
});


router.put('/:id', protect, async (req, res) => {
  const idx = store.patients.findIndex(p => p.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Bemor topilmadi" });
  store.patients[idx] = { ...store.patients[idx], ...req.body, id: +req.params.id };
  res.json(store.patients[idx]);
});


router.delete('/:id', protect, allowRoles(...NO_CLINICIAN_DELETE), async (req, res) => {
  const idx = store.patients.findIndex(p => p.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Bemor topilmadi" });
  store.patients.splice(idx, 1);
  res.json({ message: "Bemor o'chirildi" });
});

module.exports = router;