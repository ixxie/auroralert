const fetch = require('node-fetch');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var weekDayAbbreviations = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function formatTime(epoch) {
  var startDate = new Date(epoch - 600000);
  var endDate = new Date(epoch);

  var startHour = startDate.getUTCHours();
  var startMinute = startDate.getUTCMinutes();
  var endHour = endDate.getUTCHours();
  var endMinute = endDate.getUTCMinutes();
  var isMidnight = ((endHour == 0) && (endMinute == 0));

  var text =
    weekDayAbbreviations[startDate.getUTCDay()] + '\u00a0' + startDate.getUTCDate() + '.' +  (startDate.getUTCMonth() + 1) + '.\u00a0' +
    startHour + ':' + ((startMinute < 10) ? '0' + startMinute : startMinute) + '\u2013'

  if (isMidnight) {
    text +=
      weekDayAbbreviations[endDate.getUTCDay()] + '\u00a0' + endDate.getUTCDate() + '.' +  (endDate.getUTCMonth() + 1) + '.\u00a0';
  }
  text += endHour + ':' + ((endMinute < 10) ? '0' + endMinute : endMinute);

  return text;
}

let regex = /var currentData*.+/;

var previous = "";

async function run() {
  while (true) {
    var response = await fetch('https://en.ilmatieteenlaitos.fi/auroras-and-space-weather');
    var html = await response.text();
    
    var dataString = html.match(regex)[0];
    eval(dataString)

    var latest = currentData.MEK.dataSeries.pop();

    var time = formatTime(latest[0])
    var field = latest[1]

    if (time !== previous) {
      process.stdout.write(time + '  ' + field + ' nT/s\n');
      previous = time;

      if (field > 0.3) {
         process.stdout.write('Alert!')
      };
    };
    
    await delay(5000);
  };
};

run();
