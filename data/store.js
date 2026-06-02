
const { v4: uuidv4 } = require('uuid');

const store = {
  doctors: [
    { id: 1, name: "Dr. Samir Shodiyev", specialty: "Kardiologiya", department: "Yurak-qon tomir", phone: "+998 71 200-11-01", email: "s.shodiyev@caretrack.uz", experience: 15, status: "Faol" },
    { id: 2, name: "Dr. Dilafruz Norimova", specialty: "Nevrologiya", department: "Neyrologiya", phone: "+998 71 200-11-02", email: "norimovadilafruz@caretrack.uz", experience: 10, status: "Faol" },
    { id: 3, name: "Dr. Shodiyor Rafiqov", specialty: "Dermatologiya", department: "Teri kasalliklari", phone: "+998 71 200-11-03", email: "srafiqov@caretrack.uz", experience: 8, status: "Faol" },
    { id: 4, name: "Dr. Rayhona Ergasheva", specialty: "Ortopediya", department: "Suyak-bo'g'im", phone: "+998 71 200-11-04", email: "rayhona.e@caretrack.uz", experience: 12, status: "Faol" },
    { id: 5, name: "Dr. Doniyor Qodirov", specialty: "Umumiy amaliyot", department: "Umumiy bo'lim", phone: "+998 71 200-11-05", email: "doniyorqodirov@caretrack.uz", experience: 6, status: "Faol" }
  ],

  patients: [
    { id: 1, name: "Aziz Qobilov", dob: "1985-03-12", gender: "Erkak", phone: "+998 90 123-45-67", address: "Toshkent, Yunusobod", bloodType: "A+", doctorId: 1, registeredAt: "2024-01-15" },
    { id: 2, name: "Ruxshona Xamidova", dob: "1992-07-24", gender: "Ayol", phone: "+998 91 234-56-78", address: "Toshkent, Chilonzor", bloodType: "O-", doctorId: 2, registeredAt: "2024-02-20" },
    { id: 3, name: "Anisa Kabulova", dob: "1978-11-05", gender: "Ayol", phone: "+998 93 345-67-89", address: "Toshkent, Shayxontohur", bloodType: "B+", doctorId: 1, registeredAt: "2024-03-10" },
    { id: 4, name: "Dilnoza Tursunova", dob: "1965-05-18", gender: "Ayol", phone: "+998 94 456-78-90", address: "Toshkent, Mirobod", bloodType: "AB+", doctorId: 3, registeredAt: "2024-04-05" },
    { id: 5, name: "Ismoil Jovliyev", dob: "2001-09-30", gender: "Erk ak", phone: "+998 95 567-89-01", address: "Toshkent, Sergeli", bloodType: "A-", doctorId: 4, registeredAt: "2024-05-12" }
  ],

  diseases: [
    { id: 1, patientId: 1, icdCode: "U09.9", description: "Birlamchi gipertenziya", severity: "O'rtacha", diagnosis: "Arterial gipertenziya", date: "2024-01-20", status: "Davolanmoqda" },
    { id: 2, patientId: 1, icdCode: "I11.8", description: "Aterosklerotik yurak kasalligi", severity: "Og'ir", diagnosis: "Koronar arteriya kasalligi", date: "2024-02-15", status: "Kuzatuvda" },
    { id: 3, patientId: 2, icdCode: "S74.0", description: "Migren — aurasiz", severity: "O'rtacha", diagnosis: "Surunkali migren", date: "2024-02-25", status: "Davolanmoqda" },
    { id: 4, patientId: 3, icdCode: "I12.0", description: "O'tkir transmural miokard infarkti", severity: "Juda og'ir", diagnosis: "Miokard infarkti", date: "2024-03-12", status: "Kuzatuvda" },
    { id: 5, patientId: 4, icdCode: "Q16.0", description: "Atopik dermatit", severity: "Yengil", diagnosis: "Atopik dermatit", date: "2024-04-08", status: "Sog'aydi" },
    { id: 6, patientId: 5, icdCode: "E11.9", description: "Tizza artrozi", severity: "O'rtacha", diagnosis: "Osteoartrit", date: "2024-05-15", status: "Davolanmoqda" }
  ],

  users: [
    { id: 1, username: "admin",     password: "Admin@2024", role: "admin",        name: "Samariddin Muhammadqulov",  title: "Tizim Administratori" },
    { id: 2, username: "doctor1",   password: "Doc@1234",   role: "clinician",    name: "Dr. Samariddin", title: "Klinitsist" },
    { id: 3, username: "reception", password: "Rec@5678",   role: "receptionist", name: "Ruxshona Salimova",   title: "Qabulxona xodimi" }
  ],

  nextId: { doctors: 6, patients: 6, diseases: 7 }
};


store.getNextId = (collection) => store.nextId[collection]++;

module.exports = store;