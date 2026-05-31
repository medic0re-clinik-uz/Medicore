
const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const stats = {
    doctors:   store.doctors.length,
    patients:  store.patients.length,
    diseases:  store.diseases.length,
    recovered: store.diseases.filter(d => d.status === "Sog'aydi").length,
    treating:  store.diseases.filter(d => d.status === "Davolanmoqda").length,
    recent: {
      patients: store.patients.slice(-4).reverse(),
      diseases: store.diseases.slice(-4).reverse()
    }
  };
  res.json(stats);
});

module.exports = router;