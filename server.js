// express
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// utils
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

app.post("/report", (req, res) => {
  const IOdir = "../reports";
  const { source, nodes, params } = req.body;
  const today = new Date().toLocaleString().split(",").shift();
  const input = `${IOdir}/${source}`;
  const output = `${IOdir}/report_${today}.xlsx`;
  report.create(input, output, createConfig(nodes, params));
  res.status(201).send();
});

app.get("/chart", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    const { nodes, params } = JSON.parse(data);
    report.renderImageToClient(
      createConfig(nodes, params),
      res.status(200).send.bind(res)
    );
  });
});

app.get("/", (req, res) => {
  res.status(200).send("<h1>MAIN</h1>");
});

app.listen(PORT, () => {
  dns.lookup(os.hostname(), function (err, add, fam) {
    console.log(`test -> http://${add}:${PORT}/chart`);
  });
});
