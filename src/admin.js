import {allUser, countUser, createVoice, profileUser, subscribePay} from './db.js'
import { Markup } from 'telegraf'
import { subscribeDay, capitalizeFirstLetter } from './utils.js'

const ITEMS_PER_PAGE = 5

const adminKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('👤‍ Все пользователи', 'usersPage:1')
    ],[
        Markup.button.callback('🔍 Поиск по ID', 'search'),
        Markup.button.callback('✉️ Рассылка', 'mailing')
    ]
])

export const adminPanel = async (ctx) => {
    const userCount = await countUser()
    await ctx.replyWithMarkdown(`*Админ панель*
    
Привет ${ctx.from.first_name}

Всего пользователей: ${userCount}`, adminKeyboard)
}


export const handleCommandAdmin = async (ctx) => {
    const profile = await profileUser(ctx.message.from.id, ctx.message.from.first_name, `@${ctx.message.from.username}`)

    if (profile.role === 'admin') {
        await adminPanel(ctx)
    } else {
        await ctx.reply('Команда недоступна')
    }
}

function parseCharacterRoles(characters) {
    const characterArray = characters.split(', ')
    const characterRoles = []
    for (const character of characterArray) {
        const [name, value] = character.split(' — ')
        characterRoles.push({ name, value })
    }
    return characterRoles
}

export const handleCommandCreateNewVoice = async (ctx) => {
    try{
        const profile = await profileUser(ctx.message.from.id, ctx.message.from.first_name, `@${ctx.message.from.username}`)

        if (profile.role === 'admin') {
            const [command, languageCode, languageName, voiceName, gender, ...characterRolesArray] = ctx.message.text.split(/\s+/)
            const characters = characterRolesArray.join(' ')
            const characterRoles = characters ? parseCharacterRoles(characters) : []
            const voice = capitalizeFirstLetter(voiceName)
            const language = capitalizeFirstLetter(languageName)

            await createVoice(voice,language,languageCode,gender,characterRoles)

            ctx.replyWithMarkdown(`*Добавлен новый голос*\:
        
*Voice*\: ${voice}
*Language*\: ${language}
*Language Code*\: ${languageCode}
*Gender*\: ${gender}
*Character Roles*\: 
    ${characterRoles[0]?.name||''}
    ${characterRoles[1]?.name||''}
    ${characterRoles[2]?.name||''}`)
        } else {
            await ctx.reply('Команда недоступна')
            return
        }
    } catch (e) {
        await ctx.reply('Ошибка добавления голоса')
        console.log(e)
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
