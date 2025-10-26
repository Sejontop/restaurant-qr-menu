const QRCode = require('qrcode');
const Table = require('./models/Table'); // adjust path
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/restaurantDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function generateQRCodes() {
  try {
    const tables = await Table.find({});

    // Make sure folder exists
    if (!fs.existsSync('./qrcodes')) fs.mkdirSync('./qrcodes');

    for (let table of tables) {
      const url = `http://localhost:5173/m/${table.qrSlug}`; // use your local dev URL
      await QRCode.toFile(`./qrcodes/table-${table.tableNumber}.png`, url);
      console.log(`QR code generated for Table ${table.tableNumber}`);
    }

    mongoose.connection.close();
    console.log('All QR codes generated!');
  } catch (err) {
    console.error(err);
  }
}

generateQRCodes();
