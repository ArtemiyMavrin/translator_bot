import { Telegraf, session } from 'telegraf'
import { Stage } from 'telegraf/scenes'
import { message } from 'telegraf/filters'
import config  from 'config'
import process from 'nodemon'
import { handlePlan, handleSelectLanguage } from './handles/actions.js'
import { commands, handleCommandProfile, handleCommandStart, handleCommandVoice } from './handles/commands.js'
import { handleMessageText, handleMessageVideoNote, handleMessageVoice } from './handles/messages.js'
import {
    handleCardToCard,
    handleCardToCardOK,
    handlePayGetPhone,
    handleSelectPay,
    preCheckoutQuery,
    successfulPayment
} from './handles/pay.js'
import { handleCommandAdmin, handleCommandCreateNewVoice } from "./admin.js"
import { callback } from './callback.js'

import { scene } from './scene.js'
const phoneScene = scene.PhoneScene()
const stage = new Stage([phoneScene])

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())
bot.use(stage.middleware())

bot.telegram.setMyCommands(commands)

bot.command('start', handleCommandStart)
bot.command('profile', handleCommandProfile)
bot.command('voice', handleCommandVoice)
bot.command('plan', handlePlan)
bot.command('admin', handleCommandAdmin)
bot.command('create', handleCommandCreateNewVoice)

bot.action('selectLanguage', handleSelectLanguage)
bot.action('speed')

bot.action('profile', handleCommandProfile)

bot.action('plan', handlePlan)
bot.action('selectPay', handleSelectPay)
bot.action('pay', handlePayGetPhone)
bot.action('cardToCard', handleCardToCard)
bot.action('cardToCardOK', handleCardToCardOK)

bot.on('pre_checkout_query', preCheckoutQuery)
bot.on('successful_payment', successfulPayment)

bot.on(message('voice'), handleMessageVoice)
bot.on(message('text'), handleMessageText)
bot.on(message('photo'), handleMessageText)
bot.on(message('video_note'), handleMessageVideoNote)
bot.on(message('sticker'), ctx => {ctx.reply('Прикольный стикер')})

bot.on('callback_query', callback)

bot.launch()

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))