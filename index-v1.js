var Xray = require('x-ray');
var x = Xray();
var exec = require('child_process').exec;
var fs = require('fs');
var fileName = 'print.html';
var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var d = new Date();
var url = "http://www.historynet.com/today-in-history/" + monthNames[d.getMonth()].toLowerCase() + "-" + day(d.getUTCDate());
var url2 = "http://www.merriam-webster.com/word-of-the-day";
var url3 = "http://www.accuweather.com/en/us/chicago-il/60608/weather-forecast/348308";


function day(day) {
  if (day.toString().length < 2) {
    return ("0" + day);
  } else {
    return day;
  }
}

function buildHtml(results, wod, temp) {
  //console.log(results);
  var today = monthNames[d.getMonth()] + " " + d.getUTCDate();
  var header = `
  <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha256-7s5uDGW3AHqw6xtJmNNtr+OBRJUlgkNJEo78P4b0yRw= sha512-nNo+yCHEyn0smMxSswnf/OnX6/KwJuZTlNZBjauKhTK0c+zT+q5JOCx0UFhXQ6rJR9jg6Es8gPuD2uZcYDLqSw==" crossorigin="anonymous">
  <style>
  p {
    line-height: 1.2em;
  }
  img { width:100%;}
  </style>
  `;
  var word = `
  <div class="col-xs-6">
  <h3 style="text-align: center;text-transform: uppercase;color: #B1B1B1;font-weight: 100;font-size: 16px;letter-spacing: 10px;margin: 0 0 5px;">&nbsp;Word of the day</h3>
  <div class="well" style="height: 180px;margin:0;line-height: 25px;padding: 11px 20px;text-align: center;">
  <h2 style="color:#555;margin: 0;">
  ${wod[0].word}</h2>
  <span><em>${wod[0].type}</em></span>
  ${wod[0].pro}
  <hr style="margin:10px 0;">
  <p><strong>1</strong>${wod[0].def1}</p>
  `;
  if (wod[0].def2) {
    word += `<p>${wod[0].def2}</p></div>`;
  } else {
    word += `</div>`;
  }

  var weather = `
  <div class="col-xs-6">
  <h3 style="text-align: center;text-transform: uppercase;color: #B1B1B1;font-weight: 100;font-size: 16px;letter-spacing: 10px;margin: 0 0 5px;">&nbsp;WEATHER</h3>
  <div class="well" style="height: 180px;margin:0;line-height: 25px;padding: 11px 20px;text-align: center;">
  <div class="row" style="margin-top:20px;">
  <div class="col-xs-6">
  <h3 style="text-align: center;color: #B1B1B1;font-weight: 100;font-size: 15px;letter-spacing: 1px;margin: 0 0 5px;">today</h3>
  <h2>${temp[1].temp}</h2>
  <p>${temp[1].desc}</p>
  </div>
  <div class="col-xs-6">
  <h3 style="text-align: center;color: #B1B1B1;font-weight: 100;font-size: 15px;letter-spacing: 1px;margin: 0 0 5px;">tomorrow</h3>
  <h2>${temp[3].temp}</h2>
  <p>${temp[3].desc}</p>
  </div>
  </div>
  </div>
  </div>

  `


  var body = '<table class="table">';
  for (var i = 0; ((i < results.length) && ((i) < 15)); i++) {

    var item = results[i];
    if (item.history == undefined) {
      break;
    }
    body += `
      <tr>
      <th scope="row">${item.year}</th>
      <td>${item.history}</td>
      </tr>
    `
  }
  body += "</table>";

  return `
  <!DOCTYPE html>
  <html>
  <head>
  ${header}
  </head>
  <body>
  <div class="container">
  <div class="row">
  <div class="col-xs-12">
  <img src="urinal-logo-01.png" />
  </div>
  </div>

  <h1 style="margin-top:0;display:inline-block;color:#555;">${today}&nbsp;&nbsp;</h1><h3 style="margin-top:0;display:inline-block;color:#B1B1B1;font-weight: 300;"><span style="font-weight:normal">~</span>&nbsp;&nbsp;Today in History</h3>
  ${body}
  <div class="row">
  ${word}
  </div>
  ${weather}
  </div>
  </div>
  </body>
  </html>
  `;

};



x(url, 'section.entry-content table tr', [{
  year: 'td:nth-child(1) b',
  history: 'td:nth-child(3)',
}])(function(err, obj) {
  fs.writeFile('history.json', JSON.stringify(obj, null, 2), "utf-8", function(err) {
    fs.readFile("history.json", function(err, result) {
      var history = JSON.parse(result);
      getWord(history);
    });
  });
});

function getWord(history) {
  var hist = history;
  x(url2, 'div.main-wrapper', [{
    word: 'h1',
    type: '.word-attributes .main-attr',
    pro: '.word-attributes .word-syllables',
    def1: '.wod-definition-container p:nth-child(2)',
    def2: '.wod-definition-container p:nth-child(3)',
  }])(function(err, obj) {
    fs.writeFile('word.json', JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile("word.json", function(err, result2) {
        var wod = JSON.parse(result2);
        getTemp(history, wod);
      });
    });
  });
}

function getTemp(history, wod) {
  x(url3, '#forecast-feed-3day-sponsor ul li', [{
    temp: '.info strong.temp',
    desc: '.info span.cond',
    feel: '.info span.realfeel'
  }])(function(err, obj) {
    fs.writeFile('temp.json', JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile("temp.json", function(err, result3) {
        var temp = JSON.parse(result3);
        var html = buildHtml(history, wod, temp);
        fs.writeFile(fileName, html, "ascii", (err) => {
          if (err) throw err;
          exec("open file:///Users/johnh/Documents/Projects/daily-urinal/print.html");
        });
      });
    });
  });
}
// https://weather.com/weather/today/l/USIL0225:1:US
// wxcard-summary
