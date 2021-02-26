const SMTPClient = require("emailjs").SMTPClient;
const fs = require("fs");
const { resolve, join } = require("path");
const currentDate = new Date().toLocaleDateString().slice(0, 10);
/*_______________________________________________________________________________________*/

const reportsDir = resolve(join("../reports"));

//настройки emailjs
const client = new SMTPClient({
  user: "bot_irmaster@rigintelpro.ru",
  password: "@@@qwerty",
  host: "smtp.mail.ru",
  ssl: true,
});

const message = {
  text: "Это автоматическая рассылка от системы IR-Master",
  from: "bot_irmaster@rigintelpro.ru",
  to: "<pia@rigintel.ru>",
  subject:
    "ОТЧЕТ ЗА " +
    deltaDate(new Date(), -1, 0, 0).toLocaleDateString().slice(0, 10),
  attachment: [
    {
      data:
        "Это автоматическая рассылка от системы IR-Master Отчёт за " +
        deltaDate(new Date(), -1, 0, 0).toLocaleDateString().slice(0, 10),
      alternative: true,
    },
  ],
};
//поиск в папке reports файлов созданных сегодня
let files;
try {
  files = fs.readdirSync(reportsDir).filter((todayReport) => {
    let fullPath = reportsDir + "/" + todayReport;
    let fileStat = fs.statSync(fullPath);
    return fileStat.birthtime.toLocaleDateString() === currentDate
      ? true
      : false;
  });
  files.forEach((file) => {
    message.attachment.push({
      path: reportsDir + "/" + file,
      type: "application/zip",
      name: file,
    });
  });
} catch (err) {
  // An error occurred
  console.error(err);
}
//функция нужна для получения вчерашней даты
function deltaDate(input, days, months, years) {
  let date = new Date(input);
  date.setDate(date.getDate() + days);
  date.setMonth(date.getMonth() + months);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

module.exports = async function () {
  client.send(message, function (err, message) {
    console.log(err || message);
  });
};
// console.log(message.attachment);
// client.send(message, function (err, message) {
//   console.log(err || message);
// });
