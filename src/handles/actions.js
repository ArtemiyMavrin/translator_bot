import config from 'config'
import { checkSubscribe } from '../db.js'
import { Markup } from 'telegraf'

const price = config.get('ONE_PRICE')



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
    let buttonText = 'Оформить'
    if(checkSub) {
        subscribe = 'Активна ✅'
        buttonText = 'Продлить'
    }
    await ctx.reply(`Сейчас подписка ${subscribe}
    
💰 За ${price}₽/мес вы получаете безграничные возможности бота. Голос в текст, текст в голос - всегда под рукой!

🔒 Полная конфиденциальность данных. Ваша приватность - наш приоритет!

💔 Отказ от подписки в любой момент.

⚡️ Подписывайтесь сейчас и откройте мир удобства и эффективности с нашим телеграмм-ботом! 💫💬`,
        Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'pay')]))
}