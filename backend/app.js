const express = require("express")
const app = express();
require("dotenv").config();
require("./connection/conn")
const userApis = require("./controllers/User");
const projectApis = require("./controllers/Project");
const taskApis = require("./controllers/Task");

app.use(express.json());

app.use("/api/v1/auth",userApis);
app.use("/api/v1/projects",projectApis);
app.use("/api/v1/tasks",taskApis);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});