import { profileUser, subscribePay, updateSettingUser } from './db.js'
import { subscribeDay } from './utils.js'
import { Markup } from 'telegraf'
import { handleAllUser, adminPanel } from './admin.js'
import { handleCharacterSelect, handleVoiceSelect } from './handles/actions.js'

export const callback = async (ctx) => {
    const data = ctx.callbackQuery.data
    try {
        if (data.startsWith('info:')) {
            const userId = Number(data.split(':')[1])
            const page = data.split(':')[2]
            const user = await profileUser(userId)
            const subscribe = subscribeDay(user.subscribe)
            const addSubscribeKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('+ 30 дней', `addSub:${user.telegramId}:${user.name}:30`),
                    Markup.button.callback('+ 90 дней', `addSub:${user.telegramId}:${user.name}:90`),
                    Markup.button.callback('+ 180 дней', `addSub:${user.telegramId}:${user.name}:180`)
                ],
                [
                    Markup.button.callback('◀️ К списку пользователей', `usersPage:${page}`)
                ],
                [
                    Markup.button.callback('⏪️ Админ панель', `adminPanel`)
                ]
            ])
            const text = `*Пользователь:*
            
*ID:* ${user.id}
*Telegram ID:* \`${user.telegramId}\`
*Telegram username:* \`${user.tgUser}\`
*Имя:* ${user.name}
*Роль:* ${user.role}
*Подписка:* ${subscribe}

Продлить подписку:`
            await ctx.deleteMessage()
            ctx.replyWithMarkdown(text, addSubscribeKeyboard)
        }
    } catch (e) {
        console.error('Ошибка получения пользователя: ', e.message)
    }

    try {
        if (data.startsWith('addSub:')) {
            const id = data.split(':')[1]
            const name = data.split(':')[2]
            const day = data.split(':')[3]
            await subscribePay(id,name,day)
            await ctx.answerCbQuery('Подписка продлена успешно')
        }
    } catch (e) {
        console.error('Ошибка продления подписки: ', e.message)
        await ctx.answerCbQuery('Ошибка продления подписки')
    }

    if (data.startsWith('usersPage:')) {
        const page = parseInt(data.split(':')[1]);
        await handleAllUser(ctx, page);
    }

    if (data.startsWith('adminPanel')) {
        await ctx.deleteMessage()
        await adminPanel(ctx)
    }

    if (data.startsWith('sendPayGood:')) {
        try {
            const idSend = data.split(':')[1]
            await ctx.telegram.sendMessage(idSend,`*Подписка успешно продлена*
            
Спасибо за оплату подписки\\.  
Вы можете продолжить пользоваться ботом`,
                {
                    parse_mode: "MarkdownV2",
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "👤 Открыть профиль",
                                callback_data: `profile`
                            }]
                        ]
                    }
                })
            await ctx.answerCbQuery('Подписка успешно продлена.')
            await ctx.deleteMessage()
        } catch (error) {
            console.error('Ошибка при обработке sendPayGood:', error)
            await ctx.answerCbQuery('Произошла ошибка при продлении подписки.');
        }
    }

    if (data.startsWith('selectVoice:')) {
        const languageCode = data.split(':')[1]
        await handleVoiceSelect(languageCode,ctx)
    }

    if (data.startsWith('selectCharacter:')) {
        const voice = data.split(':')[1]
        await handleCharacterSelect(voice,ctx)
    }

    if (data.startsWith('updateSettingUser:')) {
        const voice = data.split(':')[1]
        const character = data.split(':')[2]
        await updateSettingUser(voice, character, ctx)
    }

}