const express = require("express")
const app = express();
require("dotenv").config();
require("./connection/conn")
const userApis = require("./controllers/User");
const allUsers = require("./controllers/GetUsers");
const projectApis = require("./controllers/Project");
const taskApis = require("./controllers/Task");
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/api/v1/auth",userApis);
app.use("/api/v1/projects",projectApis);
app.use("/api/v1/tasks",taskApis);
app.use("/api/v1/users",allUsers);


app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

