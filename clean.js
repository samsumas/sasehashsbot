// ignores everything for 10 seconds
const Telegraf = require('telegraf');
require('dotenv').config(); // for apikeys

const bot = new Telegraf(process.env.APIKEY_TELEGRAM);
setTimeout(() => { throw "Restart" }, 1000);

bot.startPolling();