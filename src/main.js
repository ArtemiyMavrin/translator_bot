import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import config  from 'config'
import process from 'nodemon'
import { handlePlan, handleSelectedVoice } from './handles/actions.js'
import { commands, handleCommandProfile, handleCommandStart, handleCommandVoice } from './handles/commands.js'
import { handleMessageText, handleMessageVoice } from './handles/messages.js'
import { handlePay, successfulPayment } from './handles/pay.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.telegram.setMyCommands(commands)

bot.command('start', handleCommandStart)
bot.command('profile', handleCommandProfile)
bot.command('voice', handleCommandVoice)
bot.command('plan', handlePlan)

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль',))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна',))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп',))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн',))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос',))

bot.action('profile', handleCommandProfile)

bot.action('pay', handlePay)
bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true))
bot.on('successful_payment', successfulPayment)

bot.on(message('voice'), handleMessageVoice)
bot.on(message('text'), handleMessageText)

bot.launch()

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))