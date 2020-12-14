module.exports = {
  type: "png",
  options: {
    title: {
      text: "",
    },
    chart: {
      width: 1000,
      height: 2000,
    },
    credits: {
      enabled: false,
    },
    xAxis: {},
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
