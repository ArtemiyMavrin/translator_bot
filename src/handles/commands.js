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

🔘 Теперь я могу переводить в текст "кружки" (видеосообщения)

🎁 Вы можете бесплатно пользоваться ботом 24 часа.

🤖 Сейчас оформить подписку на бота невозможно. Бот предоставляется в подарок к нашему основному боту
@ChatGPT\_VoiceAssistant\_Bot 
Вы можете оформить подписку на наш основной бот и пользоваться этим ботом бесплатно`

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
    if (checkSub) {
        const checkTime = Number(user.subscribe) - nowTimeSecond()
        subscribe = convertSeconds(checkTime)
    }
    await ctx.reply(`👤 Профиль:

ID: ${user.telegramId}
Имя: ${user.name}
Подписка: ${subscribe}`,
        Markup.inlineKeyboard([Markup.button.callback(`💳 Подробнее о подписке`, 'plan')]))
}

export const handleCommandVoice = async(ctx) =>  {
    const { message_id } = await ctx.reply('Выбери голос озвучки текстовых сообщений',VoiceKeyboard)
}