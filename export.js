function createConfig(nodes, params) {
  function map_range(value, low1, high1, low2, high2) {
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }
  function calc_extremes(array) {
    const v = array.map(el => el[1]);
    return [Math.min.apply(null, v), Math.max.apply(null, v)];
  }

  const exportSettings = {
    type: "png",
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

      title: {
        text: "",
      },
      chart: {
        width: 1900,
        height: 6000,
        inverted: true,
      },
      credits: {
        enabled: false,
      },
      tooltip: { enabled: false },
      legend: { enabled: false },
      plotOptions: {
        series: {
          enableMouseTracking: false,
        },
      },
      xAxis: {
        type: "datetime",
        tickInterval: 1000 * 60 * 5,
        min: Date.parse(params.starttime),
        max: Date.parse(params.endtime),
      },
      yAxis: [
        {
          title: {
            text: "",
          },
          width: "25%",
          offset: 0,
          opposite: true,
          labels: { enabled: false },
        },
        {
          title: {
            text: "",
          },
          width: "25%",
          left: "25%",
          offset: 0,
          opposite: true,
          labels: { enabled: false },
        },
        {
          title: {
            text: "",
          },
          width: "25%",
          left: "50%",
          offset: 0,
          opposite: true,
          labels: { enabled: false },
        },
        {
          title: {
            text: "",
          },
          width: "25%",
          left: "75%",
          offset: 0,
          opposite: true,
          labels: { enabled: false },
        },
      ],
      series: [],
    },
  };

  // Смещение графиков
  let current_yAxis = 0;
  let capacity = 0;
  //---------------------
  nodes.forEach(node => {
    const { name, data } = node;
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
        for (let idx = 0; idx < parsed.length; idx++) {
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
      const extremes = calc_extremes(aggregated);
      const interpolated = aggregated.map(point => [
        point[0],
        map_range(
          point[1],
          extremes[0],
          extremes[1],
          extremes[0] < 0 ? -10 : 0,
          10
        ),
      ]);

      exportSettings.options.series.push({
        name,
        keys: ["x", "y"],
        data: interpolated,
        yAxis: current_yAxis,
      });
    } else {
      exportSettings.options.series.push({
        name,
        yAxis: current_yAxis,
      });
    }
    capacity += 1;
    exportSettings.options.yAxis[
      current_yAxis
    ].title.text += `<span>${name}</span><br>`;
    if (capacity == 6) {
      capacity = 0;
      current_yAxis += 1;
    }
  });

  return exportSettings;
}

module.exports = { createConfig };
