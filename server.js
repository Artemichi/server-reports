const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const report = require("./report");

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
  console.log("__REPORT__");

  //const source = `report_${yesterday}.csv`;
  const { filename } = req.body;
  const input = `${inputFolder}/${filename}`;

  const output = `${outputFolder}/report_${today}.xlsx`;

  report.create(input, output);
});

app.get("/", (req, res) => {
  console.log("__MAIN__");
  //report.renderChartImage()
});

app.listen(PORT, () => {
  console.log("SERVER IS UP");
  console.log("RUNNING ON PORT: " + PORT);
});
