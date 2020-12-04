const Excel = require("exceljs");
const exporter = require("highcharts-export-server");
const fs = require("fs");

var exportSettings = {
  type: "png",
  options: {
    title: {
      text: "My Chart",
    },
    xAxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mar",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    series: [
      {
        type: "line",
        data: [1, 3, 2, 4],
      },
      {
        type: "line",
        data: [5, 3, 4, 2],
      },
    ],
  },
};

/**
 * Description. Creates xlsx report from given csv source file.
 *
 * @global
 *
 * @param {String}   input       Path to CSV source file.
 * @param {String}   output      Output file path.
 */
async function create(input, output) {
  //Set up a pool of PhantomJS.
  exporter.initPool();

  exporter.export(exportSettings, async function (err, res) {
    // get base64 encoded.
    const { data } = res;

    // INPUT. Create instance of Excel book and read input.csv file.
    const csvWB = new Excel.Workbook();
    const csvWS = await csvWB.csv.readFile(input);

    // Create instance of Excel book.
    const xlsxWB = new Excel.Workbook();
    // Add new worksheet and write data from read csv.
    const xlsx_report_WS = xlsxWB.addWorksheet("Report");
    csvWS.eachRow(function (row) {
      xlsx_report_WS.addRow(row.values[1].split(";"));
    });

    // Apply styles to worksheet.
    xlsx_report_WS.getColumn(1).width = 35;
    [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((col) => {
      xlsx_report_WS.getColumn(col).width = col > 4 ? 15 : 20;
    });

    // Create worksheet for charts, add image object to workbook adn worksheet.
    const xlsx_chart_WS = xlsxWB.addWorksheet("Chart");
    const image = xlsxWB.addImage({
      base64: data,
      extension: "png",
    });
    xlsx_chart_WS.addImage(image, {
      tl: { col: 0, row: 2 },
      br: { col: 10, row: 20 },
    });

    // Write created xlsx to given path.
    await xlsxWB.xlsx.writeFile(output);

    // Delete source csv file.
    // fs.unlinkSync(input)

    exporter.killPool();
  });
}

async function renderChartImage() {
  exporter.initPool();
  exporter.export(exportSettings, async function (err, res) {
    const { data } = res;
    fs.writeFile("out.png", data, "base64");
  });
}

module.exports = { create, renderChartImage };
