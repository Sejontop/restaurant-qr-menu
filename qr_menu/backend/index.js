const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const menuRoutes = require("./routes/menuRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Restaurant QR API is running...");
});

app.use("/api/menu", menuRoutes);

app.listen(3000,()=>{
    console.log("Sevrer is running on port 3000");
})