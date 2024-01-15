import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import config  from 'config'
import process from 'nodemon'
import { handlePlan, handleSelectedVoice } from './handles/actions.js'
import { commands, handleCommandProfile, handleCommandStart, handleCommandVoice } from './handles/commands.js'
import { handleMessageText, handleMessageVideoNote, handleMessageVoice } from './handles/messages.js'
import { handlePay, preCheckoutQuery, successfulPayment } from './handles/pay.js'
import { callbackUsers, handleAllUser, handleCommandAdmin } from "./admin.js"

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.telegram.setMyCommands(commands)

bot.command('start', handleCommandStart)
bot.command('profile', handleCommandProfile)
bot.command('voice', handleCommandVoice)
bot.command('plan', handlePlan)
bot.command('admin', handleCommandAdmin)

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль',))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна',))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп',))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн',))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос',))

bot.action('profile', handleCommandProfile)

bot.action('pay', handlePay)
bot.on('pre_checkout_query', preCheckoutQuery)
bot.on('successful_payment', successfulPayment)

bot.on(message('voice'), handleMessageVoice)
bot.on(message('text'), handleMessageText)
bot.on(message('photo'), handleMessageText)
bot.on(message('video_note'), handleMessageVideoNote)
bot.on(message('sticker'), ctx => {ctx.reply('Прикольный стикер')})

bot.on('callback_query', callbackUsers)

bot.launch()

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))