const mongoose = require('mongoose');
const Table = require('./models/Table'); 
const { nanoid } = require('nanoid');

mongoose.connect('mongodb://localhost:27017/restaurantDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addQrSlugs() {
  try {
    const tables = await Table.find({ qrSlug: { $exists: false } });

    for (let table of tables) {
      table.qrSlug = nanoid(8);
      await table.save();
      console.log(`Table ${table.tableNumber} -> qrSlug: ${table.qrSlug}`);
    }

    console.log('All missing qrSlugs added!');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

addQrSlugs();
