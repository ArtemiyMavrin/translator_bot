import config from 'config'
import { allLanguage, checkSubscribe, allVoice, allCharacter, updateSettingUser } from '../db.js'
import { Markup } from 'telegraf'

const price = config.get('ONE_PRICE')



export const handleSelectLanguage = async (ctx) => {
    try {
        const languageList = await allLanguage()

        const selectLanguageKeyboard = Markup.inlineKeyboard(
            languageList.map((voice) => [
                Markup.button.callback(
                    voice.language,
                    `selectVoice:${voice.languageCode}`
                ),
            ])
        )
        await ctx.deleteMessage()
        await ctx.replyWithMarkdown(`*Для начала выбери язык озвучки:*`,selectLanguageKeyboard)
    } catch (e) {
        console.log('Не удалось получить список языков', e)
    }
}

export const handleVoiceSelect = async (languageCode, ctx) => {
    try {
        const voiceList = await allVoice(languageCode)
        const selectVoiceKeyboard = Markup.inlineKeyboard(
            voiceList.map((voice) => [
                Markup.button.callback(
                    `${voice.voice} (${voice.gender})`,
                    `selectCharacter:${voice.voice}`
                ),
            ])
        )
        await ctx.deleteMessage()
        await ctx.replyWithMarkdown(`*Выберите голос:*`, selectVoiceKeyboard)
    } catch (e) {
        console.log('Не удалось получить список голосов', e)
    }
}

export const handleCharacterSelect = async (voice, ctx) => {
    try {
        const characterList = await allCharacter(voice)
        if (!characterList[0]) {
            await updateSettingUser(voice, null, ctx)
            return
        }
        const selectVoiceKeyboard = Markup.inlineKeyboard(
            characterList.map((character) => [
                Markup.button.callback(
                    character.name,
                    `updateSettingUser:${voice}:${character.role}`
                ),
            ])
        )
        await ctx.deleteMessage()
        await ctx.replyWithMarkdown(`*Выберите эмоциональнве настройки для глоса:*`, selectVoiceKeyboard)
    } catch (e) {
        console.log('Не удалось получить список голосов', e)
    }
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
        Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'selectPay')]))
}