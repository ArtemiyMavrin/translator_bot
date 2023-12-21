import { checkSubscribe } from '../db.js'
import { Markup } from 'telegraf'

export const handleSelectedVoice = (voice,voiceName) => async (ctx) => {
    ctx.session ??= { voice: '' }
    ctx.session.voice = voice
    const selectVoiceMessage = `Отлично! Твой выбор — ${voiceName}!`
    await ctx.answerCbQuery(selectVoiceMessage)
    await ctx.reply(selectVoiceMessage)
}

export const handlePlan = async (ctx) => {
    const checkSub = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    let subscribe = 'Не активна 😢'
    if(checkSub) {
        subscribe = 'Активна ✅'
    }
    await ctx.reply(`Сейчас подписка ${subscribe}
    
💰 С подпиской вы получаете безграничные возможности бота.
— Озвучка вашего текста
— Расшифровка голосовых сообщений в текст
— Расшифровка "Кружков" в текст

🔒 Полная конфиденциальность данных. Данные нигде не хранятся!

💔 Отказ от подписки в любой момент.

⚡️  К сожалению купить подписку отдельно на данный бот сейчас невозможно. Бот предоставляется в подарок к нашему основному боту
@ChatGPT\_VoiceAssistant\_Bot 
Вы можете оформить подписку на наш основной бот и пользоваться этим ботом бесплатно`,
        Markup.inlineKeyboard([Markup.button.url(`Перейти в основной бот`, 'https://t.me/ChatGPT_VoiceAssistant_Bot')]))
}