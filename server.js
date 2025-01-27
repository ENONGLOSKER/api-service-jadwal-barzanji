// Import dependencies
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Aktifkan CORS untuk semua origin
app.use(express.json()); // Parsing JSON body

// File database (disimpan di folder /tmp untuk kompatibilitas Vercel)
const DB_FILE = path.join('/tmp', 'data.json');

// Helper untuk membaca file database
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([])); // Buat file kosong jika belum ada
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error membaca database:', err.message);
        return [];
    }
}

// Helper untuk menulis file database
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        console.log('Database berhasil diperbarui.');
    } catch (err) {
        console.error('Error menulis ke database:', err.message);
        throw err;
    }
}

// Endpoint root untuk memeriksa API
app.get('/', (req, res) => {
    res.json({ message: 'Hello! Ini adalah API service untuk jadwal Barzanji.' });
});

// Endpoint untuk mendapatkan semua data (GET /items)
app.get('/items', (req, res) => {
    try {
        const data = readDatabase();
        res.json(data);
    } catch (err) {
        console.error('Error pada GET /items:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk menambah data baru (POST /items)
app.post('/items', (req, res) => {
    const { nama, tanggal, alamat } = req.body;

    if (!nama || !tanggal || !alamat) {
        return res.status(400).json({ error: 'Semua field (nama, tanggal, alamat) harus diisi.' });
    }

    try {
        const data = readDatabase();

        // Buat item baru
        const newItem = {
            id: data.length > 0 ? data[data.length - 1].id + 1 : 1,
            nama,
            tanggal,
            alamat,
        };

        data.push(newItem);
        writeDatabase(data);

        res.status(201).json(newItem);
    } catch (err) {
        console.error('Error pada POST /items:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk memperbarui data berdasarkan ID (PUT /items/:id)
app.put('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nama, tanggal, alamat } = req.body;

    if (!nama || !tanggal || !alamat) {
        return res.status(400).json({ error: 'Semua field (nama, tanggal, alamat) harus diisi.' });
    }

    try {
        const data = readDatabase();
        const index = data.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Data tidak ditemukan.' });
        }

        // Perbarui data
        data[index] = { ...data[index], nama, tanggal, alamat };
        writeDatabase(data);

        res.json(data[index]);
    } catch (err) {
        console.error('Error pada PUT /items/:id:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk menghapus data berdasarkan ID (DELETE /items/:id)
app.delete('/items/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        const data = readDatabase();
        const newData = data.filter(item => item.id !== id);

        if (newData.length === data.length) {
            return res.status(404).json({ error: 'Data tidak ditemukan.' });
        }

        writeDatabase(newData);

        res.json({ message: 'Data berhasil dihapus.' });
    } catch (err) {
        console.error('Error pada DELETE /items/:id:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Export app untuk Vercel
module.exports = app;
