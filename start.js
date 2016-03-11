// ---- Node config ---- //
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Added as a workaround for bad SSL Certs

// ---- Requires  ---- //
var phantom = require('x-ray-phantom');
var Xray = require('x-ray');
var fs = require('fs');
var exec = require('child_process').exec;

// ---- Options ---- //
var factOn = true;


// ---- Globals  ---- //
var x = Xray(); //.driver(phantom());
var printFile = 'print.html';
var d = new Date();
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var today = monthNames[d.getMonth()] + " " + d.getUTCDate();


// ---- Helper Fuctions ---- //


// ---- Asynchronus functions called in order (Synchronusly) lolz ---- //
function scrapeInOrder(cb) {
  console.log("Scraping data...");
  getHistory(function(dataHistory) {
    getWord(function(dataWord) {
      getEtymology((function(dataEtymology) {
        getGoogleWord((function(dataGoogleWord) {
          getWeather(function(dataWeather) {
            getFact(function(dataFact) {
              getNews(function(dataNews) {
                getGoogleQA(function(dataQA) {
                  buildHtml(dataHistory, dataWord, dataEtymology, dataGoogleWord, dataWeather, dataFact, dataNews, dataQA, cb);
                });
              });
            });
          });
        }), dataWord);
      }), dataWord);
    });
  });
};


// ---- Get History Data ---- //
function getHistory(cb) {
  var url = "http://www.history.com/this-day-in-history/";
  var data = "data/history.json";
  x(url, '.container', [{
    year: '.current span.year',
    history: '.current a',
    excrept1: 'article.article p:nth-child(1)',
    excrept2: 'article.article p:nth-child(2)'
  }])(function(err, obj) {
    obj[0].excrept1 = obj[0].excrept1.substring(0, obj[0].excrept1.indexOf('.'));
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Word Data ---- //
function getWord(cb) {
  var url = "http://www.merriam-webster.com/word-of-the-day";
  var data = "data/word.json";
  x(url, 'div.main-wrapper', [{
    word: 'h1',
    type: '.word-attributes .main-attr',
    pro: '.word-attributes .word-syllables',
    def1: '.wod-definition-container p:nth-child(2)',
    def2: '.wod-definition-container p:nth-child(3)',
  }])(function(err, obj) {
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Google Word Data ---- // // --- Careful with this scrape.. it's Google
function getGoogleWord(cb, word) {
  var url = "https://www.google.com/search?q=define+" + word[0].word;
  var data = "data/googleWord.json";
  x(url, '#lfoot', [{
    origin: 'script@html'
  }])(function(err, obj) {
    if (obj == '') {
      obj = [{
        origin: 'Nothing found'
      }];
    }
    var regex = /\_image\_src\=\'(.*?)\'\;/g,
      item, matches = [];
    while (item = regex.exec(obj[0].origin)) {
      matches.push(item[1]);
    }
    obj[0].origin = matches[0].replace('\\075', '=').replace('\\75', '=');
    obj[0].history = matches[1].replace('\\075', '=').replace('\\75', '=');
    fs.writeFile(data, JSON.stringify(obj, null, 2), "ascii", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Word etymology Data ---- //
function getEtymology(cb, word) {
  var url = "http://www.etymonline.com/index.php?allowed_in_frame=0&search=" + word[0].word.replace(" ", "+");
  var data = "data/etymology.json";
  x(url, '#dictionary', [{
    etymology: 'dd.highlight'
  }])(function(err, obj) {
    if (obj == '') {
      obj = [{
        etymology: 'No etymology found'
      }];
    }
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Weather Data ---- //
function getWeather(cb) {
  var url = "http://www.accuweather.com/en/us/chicago-il/60608/weather-forecast/348308";
  var data = "data/weather.json";
  x(url, '#forecast-feed-3day-sponsor ul li', [{
    temp: '.info strong.temp',
    desc: '.info span.cond',
    feel: '.info span.realfeel'
  }])(function(err, obj) {
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Fact Data ---- //
function getFact(cb) {
  var url = "https://www.beagreatteacher.com/daily-fun-fact/";
  var data = "data/fact.json";
  x(url, 'main', [{
    fact: 'p:nth-child(7)',
    joke: 'p:nth-child(5)'
  }])(function(err, obj) {
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get News Data ---- //
function getNews(cb) {
  var url = "https://news.google.com/";
  var data = "data/news.json";
  x(url, '.blended-wrapper', [{
    headline: 'h2.esc-lead-article-title',
    src: '.al-attribution-cell.source-cell'
  }])(function(err, obj) {
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}

// ---- Get Google QA Data ---- // // --- Careful with this scrape.. it's Google
function getGoogleQA(cb) {
  var url = "https://www.google.com/search?q=i%27m+feeling+curious";
  var data = "data/googleQA.json";
  x(url, '._Wtj', [{
    q: '._cNh',
    a: '._dNh'
  }])(function(err, obj) {
    if (obj == '') {
      obj = [{
        q: 'Nothing found',
        a: 'Nothing found'
      }];
    }
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}



// ---- Build HTML File ---- //
function buildHtml(history, word, etymology, googleWord, weather, fact, news, qa, cb) {

  var head = `
  <head>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha256-7s5uDGW3AHqw6xtJmNNtr+OBRJUlgkNJEo78P4b0yRw= sha512-nNo+yCHEyn0smMxSswnf/OnX6/KwJuZTlNZBjauKhTK0c+zT+q5JOCx0UFhXQ6rJR9jg6Es8gPuD2uZcYDLqSw==" crossorigin="anonymous">
    <link href="assets/style.css" rel="stylesheet" />
  </head>
  `,
    header = `
  <div class="row">
    <div class="col-xs-12">
      <img src="assets/urinal-logo.png" />
    </div>
  </div>
  <div class="row">
    <div class="col-xs-4">
      <hr>
    </div>
    <div class="col-xs-4 date">
      <span>${today}</span>
    </div>
    <div class="col-xs-4">
      <hr>
    </div>
  </div>
  `;

  /* ==============================
     =        BUILD HISTORY       =
     ============================== */
  var htmlHistory = `
     <h3>Today in History</h3>
     <div class="well">
        <div class="year">${history[0].year}</div>
        <div class="history">${history[0].history}</div>
        <hr style="margin:5px;">
        <div class="excrept">
          <p>${history[0].excrept1}</p>
        </div>
     </div>
     `;


  /* ==============================
     =        BUILD WEATHER       =
     ============================== */
  var htmlWeather = `
     <h3>WEATHER</h3>
     <div class="well">
       <div class="row">
         <div class="col-xs-6">
           <h5>today</h5>
           <h2>${weather[1].temp}</h2>
           <p>${weather[1].desc}</p>
         </div>
         <div class="col-xs-6">
           <h5>tomorrow</h5>
           <h2>${weather[3].temp}</h2>
           <p>${weather[3].desc}</p>
         </div>
       </div>
     </div>
     `;


  /* ==============================
     =        BUILD Word          =
     ============================== */
  var htmlEtymology;
  if (word[0].def2) {
    htmlEtymology = `
           <p>${word[0].def1}</p>
           <p>${word[0].def2}</p>
           <p class="etom">${etymology[0].etymology}</p>
           `;
  } else {
    htmlEtymology = `
          <p>
          <strong>1</strong>${word[0].def1}</p>
          <p class="etom">${etymology[0].etymology}</p>
          `;
  }

  var htmlWord = `
     <h3>Word of the day</h3>
     <div class="well">
       <h2 style="color:#555;margin: 0;">${word[0].word}</h2>
       <span>(<em>${word[0].type}</em>)</span>
        ${word[0].pro}
       <hr style="margin:10px 0;">
        ${htmlEtymology}
        <p style="margin:0;">
          <img src="${googleWord[0].origin}" style="width:100%;"/>
        </p>
        <p>
          <img src="${googleWord[0].history}" style="width:100%;"/>
        </p>
       </div>
     `;


  /* ==============================
     =        BUILD Fact         =
     ============================== */
  if (factOn) {
    var htmlFact = `
      <div class="col-xs-12">
        <h3>RANDOM FACT</h3>
        <div class="well fact">
         <p>${fact[0].fact}</p>
        </div>
      </div>
      `;
  } else {
    var htmlFact = '';
  }


  /* ==============================
     =        BUILD News          =
     ============================== */
  var htmlNews = `
     <h3>Headlines</h3>
     <div class="well news">
     `;
  for (var i = 0;
    ((i < news.length) && (i < 3)); i++) {
    var story = news[i];
    htmlNews += `
         <div>${story.headline}</div>
         <p>${story.src}</p>
       `
  }
  htmlNews += "</div>";


  /* ==============================
     =        BUILD Q&A         =
     ============================== */

    var htmlFact = `
      <div class="col-xs-12">
        <h3>TODAY'S Q&A</h3>
        <div class="well QA">
         <p>${qa[0].q}</p>
         <p>${qa[0].a}</p>
        </div>
      </div>
      `;



  /* ==============================
     =        B O D Y             =
     ============================== */
  var body = `
      ${header}
      <div class="row">
        <div class="col-xs-6">
          <div class="col-xs-12">
            ${htmlNews}
          </div>
          <div class="col-xs-12">
            ${htmlHistory}
          </div>
          ${htmlFact}
        </div>
        <div class="col-xs-6">
          <div class="col-xs-12">
            ${htmlWeather}
          </div>
          <div class="col-xs-12">
            ${htmlWord}
          </div>

        </div>
      </div>
      `

  /* ==============================
     =        HTML                =
     ============================== */
  var html = `
      <html>
      ${head}
        <body>
          <div class="container">
            ${body}
          </div>
        </body>
      </html>
      `
  cb(html);
}


// ---- Run Scraper Function ---- //
scrapeInOrder(function(html) {
  console.log('Finished Scraping, Opening up HTML');
  fs.writeFile(printFile, html, "ascii", (err) => {
    if (err) throw err;
    exec("open print.html");
  });
});
