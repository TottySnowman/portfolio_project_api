const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./dbConfig");
const app = express();
const mysql = require("mysql");

app.use(cors());
app.use(bodyParser.json());
app.use("/logo", express.static("logo"));
app.get("/getAllProjects", function (req, res) {
  const connection = mysql.createConnection(config);

  connection.connect(function (connection_error) {
    if (connection_error) {
      // Handle connection error
      return res
        .status(500)
        .json({ error: "Failed to connect to the database" });
    }

    connection.query(
      "SELECT * FROM Project where FK_Project_Status = '5'",
      function (err, projects) {
        if (err) {
          // Handle query error
          connection.end(); // Close the connection

          return res.status(500).json({ error: "Failed to fetch projects" });
        }

        connection.end(); // Close the connection
        projects.forEach((element) => {
          let oldPath = element.Logo_Path;
          element.Logo_Path = process.env.CYCLIC_URL + oldPath;
        });
        console.log(projects);
        res.json(projects);
      }
    );
  });
});
const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Server is running at http://${host}:${port}`);
});
