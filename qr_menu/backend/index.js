const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require('./routes/OrderRoutes'); 
const tableRoutes = require('./routes/TableRoutes'); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);
app.use("/api/auth", require("./routes/authRoutes.js"));
app.use('/api/tables', tableRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Restaurant QR API is running...");
});

app.use("/api/menu", menuRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(3000,()=>{
    console.log("Sevrer is running on port 3000");
})