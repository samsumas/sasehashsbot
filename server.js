const Telegraf = require('telegraf');
const najax = require('najax');
const loadJsonFile = require('load-json-file');
const { JSDOM } = require('jsdom');
const _ = require('underscore');
const fs = require('fs');
const childProcess = require('child_process');
const http = require('http');

const PORT = 8080;
require('dotenv').config(); // for apikeys

const dictionary = loadJsonFile.sync('./samisDictionary.json');
const userDic = loadJsonFile.sync('./userDic.json');
let lastQuote; // cache the results of '/getquote <string>'
let wannaBuy;
let lenny; // cache, contains the foodporn images for lenny
let lennypage = 1; // contains the nth result page in lenny
let lennypos = 1; // contains the nth result in lenny
const paradise = []; // contains a lot of paradisiac things
let webfail;
let webfailcounter = 0;
let maxChars = 100;

// start the server. The server gets a request from github and then updates the local repo
//http.createServer((req, res) => {
//  switch (req.url) {
//    case '/push' :
//      childProcess.exec('git pull | grep "Already up-to-date."', (error) => {
//        if (error) {
//        // not so beautiful way to restart this script
//          throw 'Rebooting after update...';
//        }
//      });
//      res.write('Repo not updated');
//      break;
//    case '/test' :
//      res.write('This is a test');
//      break;
//    default:
//      res.write('404 not found');
//      break;
//  }
//  res.end();
//}).listen(PORT);


const invalidSize = str => str.length > maxChars;

const appendName = arr =>
  // transform ['test','b'] in ['test','test@botname','b','b@botname']
  _.flatten(_.map(arr, o => [o, `${o}@${process.env.BOT_NAME}`]));

const bot = new Telegraf(process.env.APIKEY_TELEGRAM);

bot.catch((err) => {
  console.log('Catched following error :', err)
})

bot.command(appendName(['lol']), ({ reply }) => najax({ url: 'http://www.jokes-best.com/random-jokes.php', type: 'GET' }).success(res => reply(new JSDOM(res).window.document.getElementsByClassName('joke')[0].textContent)));

const webfailHelper = (link, replyWithPhoto, replyWithVideo) => {
  if (link.search(/\.jpg$/)) {
    replyWithPhoto(link);
  } else {
    // its a GIF!
    replyWithVideo(link);
  }
  webfailcounter++;
};
bot.command(appendName(['getid']), (ctx) => {
  ctx.reply(`You are :${JSON.stringify(ctx.from)} from ${JSON.stringify(ctx.chat)}`);
});

bot.command(appendName(['getip']), ({ reply }) => {
  najax({ url: 'http://ipv6bot.whatismyipaddress.com/'}).success(r=>reply(`http://[${r}]:${PORT}/`));
});

bot.command(appendName(['webfail', 'fail']), ({ replyWithPhoto, replyWithVideo }) => {
  if (webfail !== undefined && webfail.nextElementSibling !== undefined) {
    const temp = webfail.nextElementSibling;
    const link = temp.querySelector('div:nth-child(2) a img').src;
    webfailHelper(link, replyWithPhoto, replyWithVideo);
    webfailcounter++;
  } else if (webfailcounter === 0) {
  // loads first webpage
    // downloads the page and put it in webfail
    najax({
      url: 'https://webfail.com/',
      type: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.39' } }).success((site) => {
      console.log(JSON.stringify(site));
      console.log('afternajax');
      webfail = new JSDOM(site).window.document.querySelector('#posts article:first-child');
      webfailHelper(webfail.querySelector('div:nth-child(2) a img').src, replyWithPhoto, replyWithVideo);
      console.log('this looks ok');
    }).error(err => console.log(JSON.stringify(err)));
    console.log('aftererror');
  } else {
    // loads next webpage
    // gets token to load the posts...but it isnt very beautiful i admit
    const token = webfail.querySelector('script').textContent.replace(/.*tnxt = "/, '').replace('";', '');
    najax({
      url: `http://webfail.com/ajax-index/${token}`,
      type: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36 OPR/47.0.2631.39' } }).success((site) => {
      // save new page in webfail
      webfail = new JSDOM(site).window.document.body.firstChild;
      // send new post
      webfailHelper(webfail.querySelector('div:nth-child(2) a img').src, replyWithPhoto, replyWithVideo);
    }).error(err => console.log(JSON.stringify(err)));
    console.log('hier');
  }
});

bot.command(appendName(['lennysdeath', 'lenny']), ({ replyWithPhoto }) => {
  // loads lenny if empty
  if (lenny && !lenny.data[lennypos]) {
    // load next page
    lenny = '';
    lennypage++;
  }
  if (lenny === undefined) {
    najax({ url: `https://api.imgur.com/3/gallery/search/viral//${lennypage}?q=foodporn`,
      type: 'GET',
      headers: { authorization: `Client-ID ${process.env.APIKEY_IMGUR}` },
    }).success((res) => {
      // parse the json obtained from imgur api and put it in lenny
      lenny = JSON.parse(res);
      lennypos = 1;
      // reply with link, telegram will show the first photo of this link. Thanks Telegram.
      replyWithPhoto(lenny.data[lennypos].link);
    });// .error(textStatus => console.log(`Fail! Didnt get JSON from API! Error is ${JSON.stringify(textStatus)}`));
  }
  if (lenny) {
    replyWithPhoto(lenny.data[lennypos].link); // reply with link, telegram will show the first photo of this link. Thanks Telegram.
  }
  lennypos++;
});

bot.command(appendName(['wannabuy', 'buy']), ({ replyWithPhoto, reply }) => {
  if (wannaBuy) {
    wannaBuy = wannaBuy.nextElementSibling;
    if (!wannaBuy.firstElementChild.firstElementChild.nextElementSibling) { // if this is an ad, ignore it
      wannaBuy = wannaBuy.nextElementSibling;
    }
    let str = `${wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.textContent}\n`; // title
    str += `(${wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.getAttribute('href')})`; // buy link
    str += wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling.firstElementChild.textContent; // add short descr.
    str += '\nnext: /wannabuy';
    // replyWithPhoto(wannaBuy.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.getAttribute("src"),{caption :str});
    const url = wannaBuy.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.srcset.replace(/ .*/, '');
    replyWithPhoto({ url });
    reply(str);
  } else {
    // downloads the website, save it in wannaBuy, save first element in wannaBuy
    najax({
      url: 'https://awesomestufftobuy.com',
      type: 'GET',
    }).success((res) => {
      wannaBuy = new JSDOM(res).window.document.getElementById('masonry-loop').firstElementChild.nextElementSibling;
      if (wannaBuy) {
        let str = `${wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.textContent}\n`; // title
        str += `(${wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.getAttribute('href')} )\n`; // buy link
        str += wannaBuy.firstElementChild.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling.firstElementChild.textContent; // add short descr.
        str += '\nnext: /wannabuy';
        const url = wannaBuy.firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstElementChild.srcset.replace(/ .*/, '');
        replyWithPhoto({ url });
        reply(str);
      }
    });
  }
});

bot.hears(new RegExp(`^\/(tea|tee|timer)(@${process.env.BOT_NAME})? ([0-9]*)`), ( ctx ) => {
    let time;
    if (ctx.match[3] > 70000) {
        ctx.reply(`This is too much for me, try with less time (expressed in minutes)`);
            return;
    }
    if (ctx.match[3] == 0) {
        time = 3;
    } else {
        time = ctx.match[3];
    }
    ctx.reply(`Starting ${time} minute tea timer...`);
    setTimeout( () => { ctx.reply(`${ctx.message.from.first_name}, your ${time} minute tea is ready!`); }, time*60*1000);
});

bot.hears(/^\/sayHelloTo (.*)$/, ( ctx ) => {
    ctx.telegram.sendMessage(ctx.match[1],`Hello from ${ctx.message.from.first_name}!`)
});
bot.hears(/^\/(.)olo$/, ({ match, reply }) => {
  if (invalidSize(match[1])) {
      return;
  }
  const tab = {
    s: 'Sami',
    c: 'Carl',
    j: 'Jeremias',
    p: 'Pascal',
  };
  if (tab[match[1].toLowerCase()] != null) { return reply(`${tab[match[1].toLowerCase()]} lebt nur einmal.`); }
  return reply('You Only Live Online');
});


bot.hears(new RegExp(`getquote(@${process.env.BOT_NAME})? (.*)`), ({ match, reply }) => {
  if (match[2] === '') {
    najax({ url: 'https://www.brainyquote.com/quotes_of_the_day.html', type: 'GET' }).success(res => reply(new JSDOM(res).window.document.getElementsByTagName('img')[1].getAttribute('alt')));
  } else {
    najax({ url: `https://www.brainyquote.com/search_results.html?q=${match[2]}`, type: 'GET' }).success((res) => {
      lastQuote = new JSDOM(res).window.document;

      // get results
      lastQuote = lastQuote.getElementById('quotesList');
      if (lastQuote) {
        lastQuote = lastQuote.firstElementChild;
        reply(`${lastQuote.firstElementChild.textContent.replace(/\n\n/g, '')}\n/getnextquote@${process.env.BOT_NAME}`);
      } else {
        reply('Sorry nothing found');
      }
    });
  }
});

bot.command(appendName(['nextquote']), ({ reply }) => {
  if (!lastQuote) {
    reply(`Error. Try /quote@${process.env.BOT_NAME} first!`);
  } else {
    lastQuote = lastQuote.nextElementSibling;
    let temp = lastQuote.firstElementChild.textContent.replace(/\n\n/g, '');
    if (!temp) {
      // if null, this is because evil ads contains no text and should be ignored
      lastQuote = lastQuote.nextElementSibling;
      temp = lastQuote.firstElementChild.textContent.replace(/\n\n/g, '');
    }
    if (!temp) {
      reply('Nothing found try /getquote@sasehashsbot <another search>');
    }
    reply(`${temp}\n/getnextquote@${process.env.BOT_NAME}`);
  }
});

bot.command(appendName(['doctor', 'help']), ({ reply }) => reply('I am the psychotherapist.  Please, describe your problems.'));

// sends the images
const imgurAlbumHelper = (curr, replyWithVideo, replyWithPhoto, reply) => {
  // is album?
  if (curr === undefined) {
    reply('Nothing found!');
    return;
  }
  if (curr.is_album) {
    _.each(curr.images, (e) => {
      if (e.animated) { _.delay(replyWithVideo, 500, e.mp4); } else { _.delay(replyWithPhoto, 500, e.link); }
    });
  } else if (curr.animated) { replyWithVideo(curr.mp4); } else { replyWithPhoto(curr.link); }
};

// paradise[query] contains 3 fields :
// pos (which image are we on)
// page (actual page number)
// json (api output)
bot.hears(new RegExp(`/((.+)paradise(@${process.env.BOT_NAME})?)|(.*[Ll][Ee][Nn][Nn][Yy].*)`), ({ match, replyWithVideo, replyWithPhoto, reply }) => {
  
  let query;
  if (match[2] === undefined) { query = 'foodporn'; } else { query = match[2].toLowerCase(); }
  const sort = 'top';
  if (paradise[query]) {
    const curr = paradise[query];
    if (curr.json.data[curr.pos].link) {
      imgurAlbumHelper(paradise[query].json.data[curr.pos], replyWithVideo, replyWithPhoto, reply); // send photos
      paradise[query].pos++;
    } else {
      // download next page
      paradise[query].page++;
      najax({ url: `https://api.imgur.com/3/gallery/search/${sort}/all/${paradise[query].page}?q=${query}`,
        type: 'GET',
        headers: { authorization: `Client-ID ${process.env.APIKEY_IMGUR}` },
      }).success((res) => {
        paradise[query].pos = 1;
        paradise[query].json = res;
        imgurAlbumHelper(paradise[query].json.data[0], replyWithVideo, replyWithPhoto, reply); // send photos
      }).error(reply('Nothing found :/'));
    }
  } else {
    // download json from api
    najax({ url: `https://api.imgur.com/3/gallery/search/${sort}/all/0?q=${query}`,
      type: 'GET',
      headers: { authorization: `Client-ID ${process.env.APIKEY_IMGUR}` },
    }).success((res) => {
      paradise[query] = { json: JSON.parse(res), pos: 1, page: 0 }; // add new entry
      imgurAlbumHelper(paradise[query].json.data[0], replyWithVideo, replyWithPhoto, reply); // output the images
    });
  }
});


bot.hears(new RegExp(`correct(@${process.env.BOT_NAME})? ([^ ]+) => (.*)`), ({ match, replyWithMarkdown }) => {
  if(invalidSize(match[2]) || invalidSize(match[3])) {
      return;
  }
  userDic[match[2].toLowerCase()] = match[3].replace(/`/g, '\\`');
  replyWithMarkdown(`Change Saved : Try it out !\n\`/check@${process.env.BOT_NAME} ${match[2]}\``);
  fs.readFile('userDic.json', (err, data) => {
    if (err) {
      replyWithMarkdown('Error while opening the file userDic.json');
    } else {
      const o = JSON.parse(data);
      o[match[2]] = match[3].replace(/`/g, '\\`');
      const toWrite = JSON.stringify(o);
      fs.writeFile('userDic.json', toWrite, (e) => {
        if (e) {
          replyWithMarkdown('Error while writing files!');
        }
      });
    }
  });
});

bot.hears(/sudo(@[^ ]+)+ (.+)/, ({ match, reply }) => {
  if (invalidSize(match[2])) {
      return;
  }
  reply('Access granted.');
  reply(`Executing following command '${match[2]}' with administrator right.`);
  reply(match[1]);
  reply('Processing');
  setTimeout((() => { reply('...'); setTimeout((() => { reply('...'); }), 2000); setTimeout((() => { reply('...'); }), 2000); }), 2000);
  setTimeout(() => {
    reply('Error detected. Trying to recover data.');
    setTimeout(() => reply('Failure. System destroyed', 2000));
  }, 9000);
});


bot.hears(new RegExp(`check(@${process.env.BOT_NAME})? (.+)`), ({ match, replyWithMarkdown }) => {
  if(invalidSize(match[2])) {
      return;
  }
  const input = match[2].toLowerCase().replace(/`/g, '\\`').split(' ');
  let hasChange = false;

  const output = _.map(input, (el) => {
    if (userDic[el]) {
      hasChange = true;
      return userDic[el];
    } else if (dictionary[el]) {
      hasChange = true;
      return dictionary[el];
    }
    return el;
  });

  if (hasChange) {
    return replyWithMarkdown(`Meinten Sie etwa : ${output.join(' ')}?`);
  }
  return replyWithMarkdown(`Dies erscheint mir richtig. Falls nicht :\n\`/correct@${process.env.BOT_NAME} ${match[2]} => neues Wort\``);
});


bot.on('inline_query', async (ctx) => {
  const offset = parseInt(ctx.inlineQuery.offset, 10) || 0;
  const limit = 50;

  const apiUrl = `https://api.cleanvoice.ru/myinstants/?type=many&limit=${limit}&offset=${offset}&search=${ctx.encodeURIComponent(ctx.inlineQuery.query)}`;
  najax({ url: apiUrl, type: 'GET' })
    .success((res) => {
      const items = JSON.parse(res).items;
      if (items === undefined) { return; }
      const results = items.map(item => ({
        type: 'audio',
        id: item.id.toString(),
        title: item.title.toString(), // there is no name
        audio_url: `https://www.myinstants.com/media/sounds/${item.filename}`,
      }));
      ctx.answerInlineQuery(results);
    });
  // .error(res => console.log(res));
});

bot.startPolling();

