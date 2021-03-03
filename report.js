const Excel = require("exceljs");
const exporter = require("highcharts-export-server");
const fs = require("fs");
const reportSend = require("./reportSend");

/**
 * Description. Creates xlsx report from given csv source file.
 *
 * @param {String}   input
 * @param {String}   output
 * @param {Object}   config
 */
async function create(input, output, config) {
  //Set up a pool of PhantomJS.
  exporter.initPool();

  exporter.export(config, async function (err, res) {
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
    [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(col => {
      xlsx_report_WS.getColumn(col).width = col > 4 ? 15 : 20;
    });

    // Create worksheet for charts, add image object to workbook and worksheet.
    const xlsx_chart_WS = xlsxWB.addWorksheet("Chart");
    const image = xlsxWB.addImage({
      base64: data,
      extension: "png",
    });
    // TOP, LEFT of chart offset in xlsx cells
    const colNum = 0,
      rowNum = 0,
      { width, height } = config.options.chart;
    xlsx_chart_WS.addImage(image, {
      tl: { col: colNum, row: rowNum },
      br: {
        col: colNum + Math.round(width / 64),
        row: rowNum + Math.round(height / 20),
      },
    });

    // Write created xlsx to given path.
    await xlsxWB.xlsx.writeFile(output);

    // Delete source csv file and send generated reports to email.
    fs.unlink(input, err => {
      if (err) throw err;
      reportSend();
    });

    exporter.killPool();
  });
}

/**
 * Description. Renders chart image from given configuration file and sends result to a client.
 *
 * @param {Function}   config       chart configuration.
 * @param {Function}   callback     callback to be executed with result of PhantomJS pool render.
 */
async function renderImageToClient(config, callback) {
  exporter.initPool();
  exporter.export(config, async function (err, res) {
    const { data } = res;
    const response = `<div><img src="data:image/png;base64, ${data}" alt="Chart"/></div>`;
    callback(response);
    exporter.killPool();
  });
}

// Export module methods
module.exports = { create, renderImageToClient };
