import {allUser, countUser, profileUser, subscribePay} from './db.js'
import { Markup } from 'telegraf'
import { subscribeDay } from './utils.js'

const ITEMS_PER_PAGE = 5

const adminKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('👤‍ Все пользователи', 'usersPage:1')
    ],[
        Markup.button.callback('🔍 Поиск по ID', 'search'),
        Markup.button.callback('✉️ Рассылка', 'mailing')
    ]
])

const adminPanel = async (ctx) => {
    const userCount = await countUser()
    await ctx.replyWithMarkdown(`*Админ панель*
    
Привет ${ctx.from.first_name}

Всего пользователей: ${userCount}`, adminKeyboard)
}


export const handleCommandAdmin = async (ctx) => {
    const profile = await profileUser(ctx.message.from.id, ctx.message.from.first_name)

    if (profile.role === 'admin') {
        await adminPanel(ctx)
    } else {
        await ctx.reply('Команда недоступна')
    }
}

export const handleAllUser = async (ctx, page = 1) => {
    try {
        const totalCount = await countUser()
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
        const offset = (page - 1) * ITEMS_PER_PAGE
        const users = await allUser(offset,ITEMS_PER_PAGE)
        const keyboard = users.map((user) => {
            const subscribe = subscribeDay(user.subscribe)
            return [
                {
                    text: `${user.name}     ${subscribe}`,
                    callback_data: `info:${user.telegramId}:${page}`
                }
            ]
        })
        const paginationKeyboard = [];
        if (page > 1) {
            paginationKeyboard.push([
                {
                    text: '◀️ Назад',
                    callback_data: `usersPage:${page - 1}`,
                },
            ]);
        }
        if (page < totalPages) {
            paginationKeyboard.push([
                {
                    text: 'Вперед ▶️',
                    callback_data: `usersPage:${page + 1}`,
                },
            ]);
        }

        paginationKeyboard.push([
            {
                text: '⏪️ Админ панель',
                callback_data: `adminPanel`,
            },
        ]);

        await ctx.editMessageText(`Список пользователей (Страница ${page}/${totalPages}):`);
        await ctx.editMessageReplyMarkup({
            inline_keyboard: [...keyboard, ...paginationKeyboard],
        })
    } catch (e) {
        console.error('Ошибка получения списка пользователй: ', e.message)
    }

}

export const callbackUsers = async (ctx) => {
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

}