// ---- Node config ---- //
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//Added as a workaround for bad SSL Certs

// ---- Requires  ---- //
var Xray = require('x-ray');
var fs = require('fs');
var exec = require('child_process').exec;


// ---- Globals  ---- //
var x = Xray();
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
      getEtomology((function(dataEtomology) {
        getWeather(function(dataWeather) {
          getFact(function(dataFact) {
            getNews(function(dataNews) {
              buildHtml(dataHistory, dataWord, dataEtomology, dataWeather, dataFact, dataNews, cb);
            });
          });
        });
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


// ---- Get Word Etomology Data ---- //
function getEtomology(cb, word) {
  var url = "http://www.etymonline.com/index.php?allowed_in_frame=0&search=" + word[0].word;
  var data = "data/etomology.json";
  x(url, '#dictionary', [{
    etomology: 'dd.highlight'
  }])(function(err, obj) {
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



// ---- Build HTML File ---- //
function buildHtml(history, word, etomology, weather, fact, news, cb) {

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
     var htmlWord = `
     <h3>Word of the day</h3>
     <div class="well">
       <h2 style="color:#555;margin: 0;">${word[0].word}</h2>
       <span>(<em>${word[0].type}</em>)</span>
       ${word[0].pro}
       <hr style="margin:10px 0;">
     `;
     if (word[0].def2) {
       htmlWord += `
        <p>${word[0].def1}</p>
        <p>${word[0].def2}</p>
        <p class="etom">${etomology[0].etomology}</p>
       </div>`;
     } else {
       htmlWord += `
       <p>
       <strong>1</strong>${word[0].def1}</p>
       <p class="etom">${etomology[0].etomology}</p>
       </div>
       `;
     }

 /* ==============================
    =        BUILD Fact         =
    ============================== */
     var htmlFact = `
     <h3>RANDOM FACT</h3>
     <div class="well joke">
      <p>${fact[0].fact}</p>
     </div>
     `;


 /* ==============================
    =        BUILD News          =
    ============================== */
     var htmlNews = `
     <h3>Headlines</h3>
     <div class="well news">
     `;
     for (var i = 0; ((i < news.length) && (i < 6)); i++) {
       var story = news[i];
       htmlNews += `
         <div>${story.headline}</div>
         <p>${story.src}</p>
       `
     }
     htmlNews += "</div>";



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
          ${htmlWeather}
        </div>
      </div>
      <div class="col-xs-6">
        <div class="col-xs-12">
          ${htmlHistory}
        </div>
        <div class="col-xs-12">
          ${htmlWord}
        </div>
        <div class="col-xs-12">
          ${htmlFact}
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
