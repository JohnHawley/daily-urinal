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
var jokeOn = true;


// ---- Globals  ---- //
var x = Xray(); //.driver(phantom());

var printFile = 'print.html';
var d = new Date();
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var today = monthNames[d.getMonth()] + " " + d.getUTCDate();
var day = dayNames[d.getDay()];


// ---- Helper Fuctions ---- //


// ---- Asynchronus functions called in order (Synchronusly) lolz ---- //
function scrapeInOrder(cb) {
  console.log("Scraping data...");
  getHistory(function(dataHistory) {
    getWord(function(dataWord) {
      getEtymology((function(dataEtymology) {
        getGoogleWord((function(dataGoogleWord) {
          getWeather(function(dataWeather) {
            getJoke(function(dataJoke) {
              getNews(function(dataNews) {
                getGoogleQA(function(dataQA) {
                  buildHtml(dataHistory, dataWord, dataEtymology, dataGoogleWord, dataWeather, dataJoke, dataNews, dataQA, cb);
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
    if (err) console.log("[History]" + err);
    //obj[0].excrept1 = obj[0].excrept1.substring(0, obj[0].excrept1.indexOf('.'));
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get Word Data ---- //
// function getWord(cb) {
//   var url = "http://www.merriam-webster.com/word-of-the-day";
//   var data = "data/word.json";
//   var ovride = [{
//     word: 'contretemps',
//     type: 'noun',
//     pro: 'kon-truh-tahn',
//     def1: 'an inopportune occurrence; an embarrassing mischance',
//     def2: ''
//   }];
//   x(url, 'div.main-wrapper', [{
//     word: 'h1',
//     type: '.word-attributes .main-attr',
//     pro: '.word-attributes .word-syllables',
//     def1: '.wod-definition-container p:nth-child(2)',
//     def2: '.wod-definition-container p:nth-child(3)',
//   }])(function(err, obj) {
//     if (err) console.log("[Word]" + err);
//     fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
//       fs.readFile(data, function(err, result) {
//         cb(JSON.parse(result));
//       });
//     });
//   });
// }
function getWord(cb) {
  var url = "http://www.dictionary.com/wordoftheday/";
  var data = "data/word.json";
  x(url, "#chunk-0", [{
    word: '[data-word]@data-word',
    // type: '.word-attributes .main-attr',
    // pro: '.word-attributes .word-syllables',
    // def1: '.wod-definition-container p:nth-child(2)',
    // def2: '.wod-definition-container p:nth-child(3)',
  }])(function(err, obj) {
    if (err) console.log("[Word]" + err);
    var url2 = "http://www.merriam-webster.com/dictionary/" + obj[0].word;
    x(url2, 'div.main-wrapper', [{
      type: '.word-attributes .main-attr',
      pro: '.word-attributes .word-syllables',
      def1: 'div.tense-box li:nth-child(1)',
      def2: 'div.tense-box li:nth-child(2)',
    }])(function(err, obj2) {
      if (err) console.log("[Word]" + err);
      obj2[0].word = obj[0].word;
      fs.writeFile(data, JSON.stringify(obj2, null, 2), "utf-8", function(err) {
        fs.readFile(data, function(err, result) {
          cb(JSON.parse(result));
        });
      });
    });
  });
}



// ---- Get Google Word Data ---- // // --- Careful with this scrape.. it's Google
// function getGoogleWord(cb, theword) {
//   //console.log("Right? ---> "+ theword[0].word);
//   var url = "https://www.google.com/search?q=define+" + theword[0].word;
//   var data = "data/googleWord.json";
//   x(url, "#gsr", [{
//      origin: 'div#lfoot > script@html',
//      type: '#uid_0 div.lr_dct_sf_h',
//      pro: '#uid_0 span.lr_dct_ph',
//      def1: '#uid_0 div.lr_dct_sf_sen',
//     // def2: '.wod-definition-container p:nth-child(3)',
//   }])(function(err, obj) {
//     if (err) {
//       console.log(["[Google Word]"] + err);
//       // obj = [{
//       //   origin: "Blocked By Google"
//       // }];
//     }
//     console.log(obj);
//     console.log(obj[0]);
//     console.log(obj[0].type);
//     // var regex = /\_image\_src\=\'(.*?)\'\;/g,
//     //   item, matches = [];
//     // while (item = regex.exec(obj[0].origin)) {
//     //   matches.push(item[1]);
//     // }
//     // if (matches[0] == undefined) matches[0] = 'none';
//     // if (matches[1] == undefined) matches[1] = 'none';
//     // obj[0].origin = matches[0].replace('\\075', '=').replace('\\75', '=').replace('\\x3d', '=').replace('\\x3d', '=');
//     // obj[0].history = matches[1].replace('\\075', '=').replace('\\75', '=').replace('\\x3d', '=').replace('\\x3d', '=');
//     fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
//       if (err) {console.log("[1]: "+ err);}
//       fs.readFile(data, function(err, result) {
//         if (err) {console.log("[2]: "+ err);}
//         cb(JSON.parse(result));
//       });
//     });
//   });
// }

function getGoogleWord(cb, theword) {
  var url = "https://www.google.com/search?q=define+" + theword[0].word;
  var data = "data/googleWord.json";
  x(url, '#lfoot', [{
    origin: 'script@html'
  }])(function(err, obj) {
    if (err) {
      console.log(["[Google Word]"] + err);
      obj = [{
        origin: "Blocked By Google"
      }];
    }
    var regex = /\_image\_src\=\'(.*?)\'\;/g,
      item, matches = [];
    while (item = regex.exec(obj[0].origin)) {
      matches.push(item[1]);
    }
    if (matches[0] == undefined) matches[0] = 'none';
    if (matches[1] == undefined) matches[1] = 'none';
    obj[0].origin = matches[0].replace('\\075', '=').replace('\\75', '=').replace('\\x3d', '=').replace('\\x3d', '=');
    obj[0].history = matches[1].replace('\\075', '=').replace('\\75', '=').replace('\\x3d', '=').replace('\\x3d', '=');
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
    if (err) console.log("[Etomology]" + err);
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
/*function getWeather(cb) {
  var url = "http://www.accuweather.com/en/us/chicago-il/60608/weather-forecast/348308";
  var data = "data/weather.json";
  x(url, '#forecast-feed-3day-sponsor ul li', [{
    temp: '.info strong.temp',
    desc: '.info span.cond',
    feel: '.info span.realfeel'
  }])(function(err, obj) {
    if (err) console.log("[Weather]"+err);
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
*/

// ---- Get Weather Data V2---- //
function getWeather(cb) {
  var url = "http://www.accuweather.com/en/us/chicago-il/60608/daily-weather-forecast/348308";
  var data = "data/weather.json";
  x(url, '#feed-tabs ul li.day', [{
    day: 'h3 a',
    temp: '.info strong.temp',
    desc: '.info span.cond'
  }])(function(err, obj) {
    if (err) console.log("[Weather]" + err);
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


// ---- Get JOKE Data ---- //
function getJoke(cb) {
  var url = "http://www.ajokeaday.com";
  var data = "data/joke.json";
  x(url, '#pnl-jokeoftheday', [{
    joke: '.pnl-joke@html'
  }])(function(err, obj) {
    if (err) console.log("[Joke]" + err);
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}


/*// ---- Get News Data ---- //
function getNews(cb) {
  var url = "https://news.google.com/";
  var data = "data/news.json";
  x(url, '.blended-wrapper', [{
    headline: 'h2.esc-lead-article-title',
    src: '.al-attribution-cell.source-cell'
  }])(function(err, obj) {
    if (err) console.log("[News]"+err);
    fs.writeFile(data, JSON.stringify(obj, null, 2), "utf-8", function(err) {
      fs.readFile(data, function(err, result) {
        cb(JSON.parse(result));
      });
    });
  });
}*/
// ---- Get News Data ---- //
function getNews(cb) {
  var url = "http://bigstory.ap.org/";
  var data = "data/news.json";
  x(url, '#boxes-box-homepage_curated .container-column1-column2 .article', [{
    headline: 'h5',
    blurb: 'p'
  }])(function(err, obj) {
    if (err) console.log("[News]" + err);
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
    if (err) console.log("[Google QA]" + err);
    if (obj == '') {
      obj = [{
        q: 'Blocked by Google',
        a: 'Blocked by Google'
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
function buildHtml(history, word, etymology, googleWord, weather, joke, news, qa, cb) {

  var head = `
  <head>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha256-7s5uDGW3AHqw6xtJmNNtr+OBRJUlgkNJEo78P4b0yRw= sha512-nNo+yCHEyn0smMxSswnf/OnX6/KwJuZTlNZBjauKhTK0c+zT+q5JOCx0UFhXQ6rJR9jg6Es8gPuD2uZcYDLqSw==" crossorigin="anonymous">
    <link href="assets/style.css" rel="stylesheet" />
  </head>
  `,
    header = `
    <img src="assets/blank.png" id="whiteout">
  <div class="row mast">
    <div class="col-xs-12 logo-header">
      <img src="assets/urinal-logo.png" />
    </div>
      <div class="col-xs-3">
        <hr>
      </div>
      <div class="col-xs-6 date">
        <span>${day}, ${today}</span>
      </div>
      <div class="col-xs-3">
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
  /*var htmlWeather = `
     <h3>WEATHER</h3>
     <div class="well weather">
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
     `;*/

  /* ==============================
     =        BUILD WEATHER       =
     ============================== */
  var htmlWeather = `
     <h3>WEATHER</h3>
     <div class="well weather">
       <div class="row">
         <div class="col-xs-4">
           <h5>${weather[0].day}</h5>
           <h2>${weather[0].temp}</h2>
           <p>${weather[0].desc}</p>
         </div>
         <div class="col-xs-4">
           <h5>tomorrow</h5>
           <h2>${weather[1].temp}</h2>
           <p>${weather[1].desc}</p>
         </div>
         <div class="col-xs-4">
           <h5>${weather[2].day}</h5>
           <h2>${weather[2].temp}</h2>
           <p>${weather[2].desc}</p>
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
           <hr>
           <p class="etom">${etymology[0].etymology}</p>
           `;
  } else {
    htmlEtymology = `
          <p>
          <strong>1: </strong>${word[0].def1}</p>
          <hr>
          <p class="etom">${etymology[0].etymology}</p>
          `;
  }

  var showOrigin = '';

  if (googleWord[0].origin != 'none') showOrigin = `<img src="${googleWord[0].origin}" style="width: auto;max-width:100% !important;"/>`;

  var htmlWord = `
     <h3>Word of the day</h3>
     <div class="well">
       <h2 style="color:#555;margin: 0;">${word[0].word}</h2>
       <span>(<em>${word[0].type}</em>)</span>
        ${word[0].pro}
       <hr style="margin:10px 0;">
        ${htmlEtymology}
        <p style="margin:10px 0;">
          ${showOrigin}
        </p>
        <p>
          <img src="${googleWord[0].history}" style="width: auto;max-width:100% !important;"/>
        </p>
       </div>
     `;




  /* ==============================
     =        BUILD Joke        =
     ============================== */

  /*  var htmlJoke = `
      <div class="col-xs-12">
        <h3>TODAY'S JOKE</h3>
        <div class="well fact">
        ${joke[0].joke}
        </div>
      </div>
      `;*/
  var htmlJoke = `
      <div class="col-xs-12">
        <h3>TODAY'S JOKE</h3>
        <div class="well joke">
        <p>Joke</p>
        <br>
        <p>Punchline</p>
        </div>
      </div>
      `;


  /* ==============================
     =        BUILD Til        =
     ============================== */


  var htmlTil = `
      <div class="col-xs-12">
        <h3>TODAY I LEARNED</h3>
        <div class="well til">
          <p><strong>TIL </strong> Insert stuff here</p>
        </div>
      </div>
      `;


  /* ==============================
     =        BUILD News          =
     ============================== */
  var htmlNews = `
     <h3>Big Story</h3>
     <div class="well news">
     `;
  /*for (var i = 0;
    ((i < news.length) && (i < 4)); i++) {
    var story = news[i];
    htmlNews += `
         <h2>${story[0].headline}</h2>
         <p>${story[0].blurb}</p>
       `
  }*/
  htmlNews += `
       <h2>${news[0].headline}</h2>
       <p>${news[0].blurb}</p>
     `;
  htmlNews += "</div>";


  /* ==============================
     =        BUILD Q&A         =
     ============================== */

  var htmlFact = `
      <div class="col-xs-12">
        <h3>TODAY'S Q&A</h3>
        <div class="well QA">
         <p><strong>${qa[0].q}</strong></p>
         <hr>
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
        <div class="col-xs-6 left">
          <div class="col-xs-12">
            ${htmlNews}
          </div>
          <div class="col-xs-12">
            ${htmlHistory}
          </div>
          ${htmlFact}
          ${htmlJoke}
        </div>
        <div class="col-xs-6 right">
          <div class="col-xs-12">
            ${htmlWeather}
          </div>
          <div class="col-xs-12">
            ${htmlWord}
          </div>
          <div class="col-xs-12">
            ${htmlTil}
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
