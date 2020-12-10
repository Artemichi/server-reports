const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const exporter = require("highcharts-export-server");
const fs = require("fs");

const report = require("./report");
const settings = require("./exportSettings");

// EXPRESS
const app = express();
const PORT = process.env.PORT || 4545;
app.use(bodyParser.json());
app.use(cors());

// FOLDERS
//const inputFolder = "C:/Program Files/atvise/rigdata/reports";
//const outputFolder = "C:/Program Files/atvise/rigdata/reports";
const inputFolder = "./files";
const outputFolder = "./files";

const today = new Date().toLocaleString().split(",").shift();

const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)).toLocaleString().split(",").shift())(
  new Date()
);

app.post("/report", (req, res) => {
  console.log("POST/REPORT");

  //const source = `report_${yesterday}.csv`;
  const { filename } = req.body;
  const input = `${inputFolder}/${filename}`;

  const output = `${outputFolder}/report_${today}.xlsx`;

  report.create(input, output);

  console.log(req.body);

  res.status(201).send();
});

app.get("/", (req, res) => {
  console.log("GET/");
  exporter.initPool();
  exporter.export(settings, async function (err, result) {
    const { data } = result;
    const response = `<div><img src="data:image/png;base64, ${data}" alt="Chart"/></div>`;
    res.send(response);
    //fs.writeFile("out.png", data, "base64");
    exporter.killPool();
  });
});

app.listen(PORT, () => {
  console.log("SERVER IS UP");
  console.log("RUNNING ON PORT: " + PORT);
});
