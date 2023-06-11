import { Telegraf, Markup, session } from 'telegraf'
import { message } from 'telegraf/filters'
import config  from 'config'
import process from 'nodemon'
import { speechKit } from './speechkit.js'
import { checkSubscribe, createUser, profileUser } from './db.js'
import { convertSeconds, nowTimeSecond, replaySubscribe } from './utils.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

const price = config.get('ONE_PRICE')

const VoiceKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('👨🏼‍ Эмиль (по умолчанию)', 'ermil')
    ],[
        Markup.button.callback('👩🏼 Алёна', 'alena'),
        Markup.button.callback('👨🏼 Филипп', 'filipp')
    ],[
        Markup.button.callback('👩🏼 Джейн', 'jane'),
        Markup.button.callback('👨🏼 Мадирос', 'madirus')
    ]])

const handleSelectedVoice = (voice,voiceName) => async (ctx) => {
    ctx.session ??= { voice: '' }
    ctx.session.voice = voice
    await ctx.answerCbQuery(`Отлично! Твой выбор — ${voiceName}!`)
    await ctx.reply(`Отлично! Твой выбор — ${voiceName}!`)
}

bot.use(session())

bot.command('start', async(ctx) =>  {
    await createUser(ctx.message.from.id, ctx.message.from.first_name)
    await ctx.reply(`🎙️ Привет! Я твой универсальный помощник для обмена голосовыми и текстовыми сообщениями. 
    
💬 Отправь мне голосовое сообщение, и я переведу его в текст. 

🔊 Отправь мне текст, и я превращу его в голосовое сообщение.

⚙ А еще ты можешь выбрать голос озвучки в меню

🎁 В подарок Бесплатный доступ к боту на 3 дня!

💳 Если понравится, сможешь оформить подписку всего за 49₽/мес.

Давай начнем общение – просто отправь мне свой голос или текст! 🤖💬🔊`)
})

bot.command('profile', async(ctx) =>  {
    const user = await profileUser(ctx.message.from.id, ctx.message.from.first_name)
    const checkSub = await checkSubscribe(ctx.message.from.id)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if (checkSub) {
        const checkTime = user.subscribe - nowTimeSecond()
        subscribe = convertSeconds(checkTime)
        buttonText = 'Продлить'
    }
    await ctx.reply(`👤 Профиль:
    
ID: ${user.telegramId}
Имя: ${user.name}
Подписка: ${subscribe}`,Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'pay')]))
})

bot.command('voice', async(ctx) =>  {
    await ctx.reply('Выбери голос озвучки текстовых сообщений',VoiceKeyboard)
})

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль'))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна'))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп'))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн'))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос'))


bot.on(message('voice'), async (ctx) => {
    try {
        const checkPay = await checkSubscribe(ctx.from.id)
        if(!checkPay) { return replaySubscribe(ctx) }

        const voice = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const voiceId = String(ctx.message.from.id) + String(ctx.message.message_id)
        const { message_id } = await ctx.reply('Обработка...', {
            reply_to_message_id: ctx.message.message_id
        })
        const text = await speechKit.voiceToMessage(voice, voiceId)

        await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, text, {
            reply_to_message_id: ctx.message.message_id
        })
    } catch (e) {
        console.log('Ошибка обработки голосового сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке голосового сообщения')
    }
})

bot.on(message('text'), async (ctx) => {
    try {
        ctx.session ??= { voice: 'ermil' }
        const checkPay = await checkSubscribe(ctx.from.id)
        if(!checkPay) { return replaySubscribe(ctx) }
        const text = ctx.message.text
        const { message_id } = await ctx.reply('Обработка...', {
            reply_to_message_id: ctx.message.message_id
        })
        const voiceMessage = await speechKit.messageToVoice(text, ctx.session.voice)

        await ctx.replyWithVoice({ source: voiceMessage }, {
            reply_to_message_id: ctx.message.message_id
        })

        await ctx.deleteMessage(message_id)
    } catch (e) {
        console.log('Ошибка обработки текстового сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке текстового сообщения')
    }
})

bot.launch()


process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))