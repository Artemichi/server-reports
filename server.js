// express imports
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// utils imports
const os = require("os");
const fs = require("fs");
const dns = require("dns");
// report
const report = require("./report");
const { createConfig } = require("./export");

// EXPRESS
const app = express();
const PORT = process.env.PORT || 4545;
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors());

// FOLDERS
//const inputFolder = "C:/Program Files/atvise/rigdata/reports";
//const outputFolder = "C:/Program Files/atvise/rigdata/reports";
const inputFolder = "./files";
const outputFolder = "./files";

app.post("/report", (req, res) => {
  console.log("POST/REPORT");
  const { source } = req.body;
  const today = new Date().toLocaleString().split(",").shift();
  const input = `${inputFolder}/${source}`;
  const output = `${outputFolder}/report_${today}.xlsx`;

  //report.create(input, output);

  console.log(req.body);

  // save request
  // fs.writeFile("data.json", JSON.stringify(req.body), "utf8", () =>
  //   console.log("request -> data.json")
  // );

  res.status(201).send();
});

app.get("/chart", (req, res) => {
  console.log("GET/CHART");
  fs.readFile("data.json", "utf8", (err, data) => {
    const { nodes, params } = JSON.parse(data);
    report.renderImageToClient(
      createConfig(nodes, params),
      res.status(200).send.bind(res)
    );
  });
});

app.get("/", (req, res) => {
  console.log("GET/");
  res.status(200).send("<h1>MAIN</h1>");
});

app.listen(PORT, () => {
  dns.lookup(os.hostname(), function (err, add, fam) {
    console.log("SERVER IS RUNNING");
    console.log(`LOCAL -> http://${add}:${PORT}`);
  });
});
