
const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { protect, allowRoles } = require('../middleware/auth');


router.get('/', protect, allowRoles('admin', 'clinician'), async (req, res) => {
  const { q, severity, status, patientId } = req.query;
  let list = store.diseases;

  if (q) {
    const query = q.toLowerCase();
    list = list.filter(d =>
      d.icdCode.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.diagnosis.toLowerCase().includes(query)
    );
  }
  if (severity) list = list.filter(d => d.severity === severity);
  if (status)   list = list.filter(d => d.status === status);
  if (patientId) list = list.filter(d => d.patientId === +patientId);

  res.json(list);
});


router.get('/:id', protect, allowRoles('admin', 'clinician'), async (req, res) => {
  const disease = store.diseases.find(d => d.id === +req.params.id);
  if (!disease) return res.status(404).json({ error: "Kasallik topilmadi" });
  res.json(disease);
});


router.post('/', protect, allowRoles('admin', 'clinician'), async (req, res) => {
  const { patientId, icdCode, description, severity, diagnosis, status, date } = req.body;
  if (!patientId || !icdCode || !description) {
    return res.status(400).json({ error: "Bemor, ICD kodi va tavsif majburiy" });
  }
  const patientExists = store.patients.find(p => p.id === +patientId);
  if (!patientExists) return res.status(404).json({ error: "Bemor topilmadi" });

  const disease = {
    id: store.getNextId('diseases'),
    patientId: +patientId,
    icdCode, description,
    severity: severity || "O'rtacha",
    diagnosis: diagnosis || '',
    status: status || 'Davolanmoqda',
    date: date || new Date().toISOString().slice(0, 10)
  };
  store.diseases.push(disease);
  res.status(201).json(disease);
});


router.put('/:id', protect, allowRoles('admin', 'clinician'), async (req, res) => {
  const idx = store.diseases.findIndex(d => d.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Kasallik topilmadi" });
  store.diseases[idx] = { ...store.diseases[idx], ...req.body, id: +req.params.id };
  res.json(store.diseases[idx]);
});


router.delete('/:id', protect, allowRoles('admin'), async (req, res) => {
  const idx = store.diseases.findIndex(d => d.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Kasallik topilmadi" });
  store.diseases.splice(idx, 1);
  res.json({ message: "Kasallik o'chirildi" });
});

module.exports = router;