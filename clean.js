// ignores everything for 30 seconds
const Telegraf = require('telegraf');
require('dotenv').config(); // for apikeys

const bot = new Telegraf(process.env.APIKEY_TELEGRAM);
setTimeout(() => { throw "Restart" }, 30000);
bot.hears(/^.*$/, ({ reply }) => reply(`Please standby, i am currently rebooting...`));

bot.startPolling();