const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const db = require("./config/db");
const repositoryRoutes = require("./routes/repositoryRoutes");
const githubRoutes = require("./routes/githubRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/repositories", repositoryRoutes);
app.use("/api/github", githubRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "ViewMe Backend Running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});