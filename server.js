const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const report = require("./report");
const exportSettings = require("./exportSettings");

// EXPRESS
const app = express();
const PORT = process.env.PORT || 4545;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

// FOLDERS
//const inputFolder = "C:/Program Files/atvise/rigdata/reports";
//const outputFolder = "C:/Program Files/atvise/rigdata/reports";
const inputFolder = "./files";
const outputFolder = "./files";

const today = new Date().toLocaleString().split(",").shift();

const yesterday = (d =>
  new Date(d.setDate(d.getDate() - 1)).toLocaleString().split(",").shift())(
  new Date()
);

app.post("/report", (req, res) => {
  console.log("POST/REPORT");

  //const source = `report_${yesterday}.csv`;
  const { source } = req.body;
  const input = `${inputFolder}/${source}`;

  const output = `${outputFolder}/report_${today}.xlsx`;

  //report.create(input, output);

  console.log(req.body);
  // fs.writeFile("data.json", JSON.stringify(req.body), "utf8", () =>
  //   console.log("done")
  // );

  res.status(201).send();
});

// debug chart
app.get("/chart", (req, res) => {
  console.log("GET/CHART");
  report.renderImageToClient(exportSettings, res.status(200).send.bind(res));
});

app.get("/", (req, res) => {
  console.log("GET/");

  fs.readFile("data.json", "utf8", (err, data) => {
    console.log(JSON.parse(data));
  });

  res.status(200).send("<h1>ROOT</h1>");
});

app.listen(PORT, () => {
  console.log("SERVER IS RUNNING ON PORT: " + PORT);
});
