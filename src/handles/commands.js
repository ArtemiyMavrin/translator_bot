import { checkSubscribe, createUser, profileUser } from '../db.js'
import config  from 'config'
import { convertSeconds, nowTimeSecond } from '../utils.js'
import { Markup } from 'telegraf'

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

const startMessage = `🎙️ Привет! Я твой универсальный помощник для обмена голосовыми и текстовыми сообщениями. 
    
💬 Отправь мне голосовое сообщение, и я переведу его в текст. 

🔊 Отправь мне текст, и я превращу его в голосовое сообщение.

⚙ А еще ты можешь выбрать голос озвучки в меню

🎁 В подарок Бесплатный доступ к боту на 24 часа!

💳 Если понравится, сможешь оформить подписку всего за ${price}₽/мес.

Давай начнем общение – просто отправь мне свой голос или текст! 🤖💬🔊`

export const commands = [
    { command: '/start', description: '▶️ Перезапустить бота' },
    { command: '/voice', description: '🎙️Выбрать голос' },
    { command: '/profile', description: '👤 Профиль' },
    { command: '/plan', description: '💳 Подписка' }
]

export const handleCommandStart = async (ctx) => {
    await createUser(ctx.message.from.id, ctx.message.from.first_name)
    await ctx.reply(startMessage)
}

export const handleCommandProfile = async (ctx) => {
    const user = await profileUser(ctx.from.id, ctx.from.first_name)
    const checkSub = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if (checkSub) {
        const checkTime = Number(user.subscribe) - nowTimeSecond()
        subscribe = convertSeconds(checkTime)
        buttonText = 'Продлить'
    }
    await ctx.reply(`👤 Профиль:

ID: ${user.telegramId}
Имя: ${user.name}
Подписка: ${subscribe}`,Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'pay')]))
}

export const handleCommandVoice = async(ctx) =>  {
    const { message_id } = await ctx.reply('Выбери голос озвучки текстовых сообщений',VoiceKeyboard)
}