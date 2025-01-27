// Import dependencies
const express = require('express');
const cors = require('cors'); // Untuk mengaktifkan CORS
const fs = require('fs');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Aktifkan CORS untuk semua origin
app.use(express.json()); // Parsing JSON body

// File database
const DB_FILE = 'data.json';

// Helper untuk membaca file database
function readDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([])); // Buat file kosong jika belum ada
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper untuk menulis file database
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Endpoint untuk mendapatkan semua data (GET /items)
app.get('/items', (req, res) => {
    const data = readDatabase();
    res.json(data);
});

// Endpoint untuk menambah data baru (POST /items)
app.post('/items', (req, res) => {
    const { nama, tanggal, alamat } = req.body;

    // Validasi input
    if (!nama || !tanggal || !alamat) {
        return res.status(400).json({ error: 'Semua field (nama, tanggal, alamat) harus diisi.' });
    }

    const data = readDatabase();

    // Buat item baru
    const newItem = {
        id: data.length > 0 ? data[data.length - 1].id + 1 : 1, // Generate ID otomatis
        nama,
        tanggal,
        alamat,
    };

    data.push(newItem); // Tambahkan ke array data
    writeDatabase(data); // Simpan ke file

    res.status(201).json(newItem);
});

// Endpoint untuk mengupdate data (PUT /items/:id)
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nama, tanggal, alamat } = req.body;

    // Validasi input
    if (!nama || !tanggal || !alamat) {
        return res.status(400).json({ error: 'Semua field (nama, tanggal, alamat) harus diisi.' });
    }

    const data = readDatabase();
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    // Update item
    data[index] = {
        ...data[index],
        nama,
        tanggal,
        alamat,
    };

    writeDatabase(data); // Simpan perubahan
    res.json(data[index]);
});

// Endpoint untuk menghapus data (DELETE /items/:id)
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const data = readDatabase();

    const newData = data.filter(item => item.id !== id); // Filter data untuk menghapus item
    if (newData.length === data.length) {
        return res.status(404).json({ error: 'Data tidak ditemukan.' });
    }

    writeDatabase(newData); // Simpan perubahan
    res.json({ message: 'Data berhasil dihapus.' });
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
