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
      `SELECT Project.ID, Project.Name, Project.About, Project.Github_Link, 
      Project.Demo_Link, Project.Logo_Path, status.Status, Tag.Tag, Tag.Icon
      FROM Project 
      INNER JOIN ProjectStatus as status on Project.FK_Project_Status = status.ID 
      INNER JOIN Project_Tags on Project_Tags.ProjectID = Project.ID 
      INNER JOIN Tag on Project_Tags.TagID = Tag.ID 
      WHERE Hidden = false 
      ORDER BY Dev_Date ASC`,
      function (err, projects) {
        if (err) {
          console.log(err);
          // Handle query error
          connection.end(); // Close the connection

          return res.status(500).json({ error: "Failed to fetch projects" });
        }

        connection.end(); // Close the connection

        const formattedResult = projects.reduce((acc, row) => {
          const project = acc.find((p) => p.ProjectID === row.ID);

          if (!project) {
            acc.push({
              ProjectID: row.ID,
              Name: row.Name,
              About: row.About,
              Github_Link: row.Github_Link,
              Demo_Link: row.Demo_Link,
              Logo_Path: process.env.CYCLIC_URL + row.Logo_Path,
              Status: row.Status,
              Tags: [
                {
                  Tag: row.Tag,
                  Icon: row.Icon,
                },
              ],
            });
          } else {
            project.Tags.push({
              Tag: row.Tag,
              Icon: row.Icon,
            });
          }

          return acc;
        }, []);

        res.json(formattedResult);
      }
    );
  });
});
const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Server is running at http://${host}:${port}`);
});
