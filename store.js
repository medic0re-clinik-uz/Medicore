
const { v4: uuidv4 } = require('uuid');

const store = {
  doctors: [
    { id: 1, name: "Dr. Alisher Karimov", specialty: "Kardiologiya", department: "Yurak-qon tomir", phone: "+998 71 200-11-01", email: "a.karimov@caretrack.uz", experience: 15, status: "Faol" },
    { id: 2, name: "Dr. Nilufar Rashidova", specialty: "Nevrologiya", department: "Neyrologiya", phone: "+998 71 200-11-02", email: "n.rashidova@caretrack.uz", experience: 10, status: "Faol" },
    { id: 3, name: "Dr. Bobur Toshmatov", specialty: "Dermatologiya", department: "Teri kasalliklari", phone: "+998 71 200-11-03", email: "b.toshmatov@caretrack.uz", experience: 8, status: "Faol" },
    { id: 4, name: "Dr. Malika Yusupova", specialty: "Ortopediya", department: "Suyak-bo'g'im", phone: "+998 71 200-11-04", email: "m.yusupova@caretrack.uz", experience: 12, status: "Faol" },
    { id: 5, name: "Dr. Jasur Ergashev", specialty: "Umumiy amaliyot", department: "Umumiy bo'lim", phone: "+998 71 200-11-05", email: "j.ergashev@caretrack.uz", experience: 6, status: "Faol" }
  ],

  patients: [
    { id: 1, name: "Aziz Nazarov", dob: "1985-03-12", gender: "Erkak", phone: "+998 90 123-45-67", address: "Toshkent, Yunusobod", bloodType: "A+", doctorId: 1, registeredAt: "2024-01-15" },
    { id: 2, name: "Dilnoza Mirzayeva", dob: "1992-07-24", gender: "Ayol", phone: "+998 91 234-56-78", address: "Toshkent, Chilonzor", bloodType: "O-", doctorId: 2, registeredAt: "2024-02-20" },
    { id: 3, name: "Sherzod Xoliqov", dob: "1978-11-05", gender: "Erkak", phone: "+998 93 345-67-89", address: "Toshkent, Shayxontohur", bloodType: "B+", doctorId: 1, registeredAt: "2024-03-10" },
    { id: 4, name: "Gulnora Tursunova", dob: "1965-05-18", gender: "Ayol", phone: "+998 94 456-78-90", address: "Toshkent, Mirobod", bloodType: "AB+", doctorId: 3, registeredAt: "2024-04-05" },
    { id: 5, name: "Eldor Ismoilov", dob: "2001-09-30", gender: "Erkak", phone: "+998 95 567-89-01", address: "Toshkent, Sergeli", bloodType: "A-", doctorId: 4, registeredAt: "2024-05-12" }
  ],

  diseases: [
    { id: 1, patientId: 1, icdCode: "I10", description: "Birlamchi gipertenziya", severity: "O'rtacha", diagnosis: "Arterial gipertenziya", date: "2024-01-20", status: "Davolanmoqda" },
    { id: 2, patientId: 1, icdCode: "I25.1", description: "Aterosklerotik yurak kasalligi", severity: "Og'ir", diagnosis: "Koronar arteriya kasalligi", date: "2024-02-15", status: "Kuzatuvda" },
    { id: 3, patientId: 2, icdCode: "G43.0", description: "Migren — aurasiz", severity: "O'rtacha", diagnosis: "Surunkali migren", date: "2024-02-25", status: "Davolanmoqda" },
    { id: 4, patientId: 3, icdCode: "I21.0", description: "O'tkir transmural miokard infarkti", severity: "Juda og'ir", diagnosis: "Miokard infarkti", date: "2024-03-12", status: "Kuzatuvda" },
    { id: 5, patientId: 4, icdCode: "L20.0", description: "Atopik dermatit", severity: "Yengil", diagnosis: "Atopik dermatit", date: "2024-04-08", status: "Sog'aydi" },
    { id: 6, patientId: 5, icdCode: "M17.0", description: "Tizza artrozi", severity: "O'rtacha", diagnosis: "Osteoartrit", date: "2024-05-15", status: "Davolanmoqda" }
  ],

  users: [
    { id: 1, username: "admin",     password: "Admin@2024", role: "admin",        name: "Sardor Abdullayev",  title: "Tizim Administratori" },
    { id: 2, username: "doctor1",   password: "Doc@1234",   role: "clinician",    name: "Dr. Alisher Karimov", title: "Klinitsist" },
    { id: 3, username: "reception", password: "Rec@5678",   role: "receptionist", name: "Mohira Xasanova",   title: "Qabulxona xodimi" }
  ],

  nextId: { doctors: 6, patients: 6, diseases: 7 }
};


store.getNextId = (collection) => store.nextId[collection]++;

module.exports = store;