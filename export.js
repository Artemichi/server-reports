function createConfig(nodes, params) {
  const colors = [
    "#7cb5ec",
    "#434348",
    "#5c9540",
    "#f7a35c",
    "#8085e9",
    "#f15c80",
    "#a33e2a",
    "#2b908f",
    "#f45b5b",
    "#a050d9",
  ];
  const exportSettings = {
    type: "png",
    callback: `function (chart) {
      chart.yAxis.forEach(function (ax) {
        ax.update({
          labels: {
            formatter: function () {
              return this.isLast || this.isFirst ? "" : this.value;
            },
          },
        });
      });
    }`,
    globalOptions: {
      lang: {
        shortMonths: [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Нов",
          "Дек",
        ],
      },
    },
    options: {
      time: {
        timezoneOffset: new Date().getTimezoneOffset(),
      },
      colors,
      title: {
        text: "",
      },
      chart: {
        width: 1900,
        height: 7000,
        inverted: true,
      },
      credits: {
        text: "© РИГИНТЕЛ",
        style: {
          fontSize: "10px",
          color: "#111",
        },
        position: { align: "left", x: 3, y: -2 },
      },
      legend: { enabled: false },
      xAxis: {
        type: "datetime",
        tickInterval: 1000 * 60 * 5,
        min: Date.parse(params.starttime),
        max: Date.parse(params.endtime),
      },
      yAxis: [],
      series: [],
    },
  };
  let current_yAxis = 0;
  let capacity = 0;
  let axisLimit = Math.round(nodes.length / 4);
  let colorIdx = 0;
  let axisGap = 0;
  let axisLeftOffset = 0;
  nodes.forEach(node => {
    const { name, unit, data } = node;
    if (data.length) {
      const parsed = data.map(point => {
        const { value, servertime } = point;
        return [Date.parse(servertime), value];
      });
      let start = parsed[0][0];
      const aggregated = [];
      const aggr_interval = 1000 * 60;
      while (parsed.length > 0) {
        const filtered = [];
        for (let idx = 0, len = parsed.length; idx < len; idx++) {
          const current = parsed[idx];
          if (current[0] <= start + aggr_interval) {
            filtered.push(current);
          } else break;
        }
        if (filtered.length) {
          const len = filtered.length;
          const avg = filtered.reduce((acc, cur) => acc + cur[1], 0) / len;
          aggregated.push([filtered[0][0], avg]);
          parsed.splice(0, len);
        }
        start += aggr_interval;
      }
      exportSettings.options.yAxis.push({
        title: {
          text: `<span style='color: ${colors[colorIdx]}; font-size: 15px'>${name}, ${unit}</span><br>`,
        },
        width: "25%",
        left: `${axisLeftOffset}%`,
        offset: axisGap,
        opposite: true,
        labels: {
          style: {
            color: colors[colorIdx],
            fontSize: "12px",
          },
        },
      });
      exportSettings.options.series.push({
        name,
        keys: ["x", "y"],
        data: aggregated,
        yAxis: current_yAxis,
      });

      axisGap += 50;
    } else {
      axisGap += 15;
      exportSettings.options.yAxis.push({
        title: {
          text: `<span style='color: ${colors[colorIdx]}; font-size: 15px'>${name}, ${unit}</span><br>`,
        },
        width: "25%",
        left: `${axisLeftOffset}%`,
        offset: axisGap,
        opposite: true,
      });
      exportSettings.options.series.push({
        name,
        yAxis: current_yAxis,
      });

      axisGap += 25;
    }
    colorIdx += 1;
    capacity += 1;
    current_yAxis += 1;
    if (capacity == axisLimit) {
      capacity = 0;
      axisGap = 0;
      axisLeftOffset += 25;
    }
    if (colorIdx === colors.length) colorIdx = 0;
  });

  return exportSettings;
}

module.exports = { createConfig };
