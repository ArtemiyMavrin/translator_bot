import { Composer, Scenes } from 'telegraf'
import { Markup } from 'telegraf'
import { handlePay } from "./handles/pay.js"

class Scene {
    constructor() {
    }

    PhoneScene () {
        const sPhone = new Scenes.BaseScene('sPhone')
        sPhone.enter(async (ctx) =>{
            await ctx.replyWithMarkdownV2(`*Напишите Ваш номер телефона*

Это нужно платежной системе чтобы прислать вам чек\\.
Мы нигде не храним ваши данные

*Введите номер в формате\\:* _79008887766_`,
                Markup.inlineKeyboard([
                    Markup.button.callback('Отмена', 'cancel')
                ]))
        })
        sPhone.action('cancel', async (ctx) => {
            await ctx.answerCbQuery()
            await ctx.editMessageText('Оплата отменена.')
            await ctx.scene.leave()
        })
        sPhone.on('text', async (ctx) => {
            const phone = Number(ctx.message.text)
            if (phone && phone > 0) {
                if (ctx.message.text.length < 11){
                    await ctx.replyWithMarkdown(`*Нехвататет цифр.*`)
                    await ctx.scene.reenter()
                } else {
                    await handlePay(ctx, phone)
                    await ctx.scene.leave()
                }
            } else {
                await ctx.replyWithMarkdown(`*Номер не распознан*`)
                await ctx.scene.reenter()
            }
        })
        sPhone.on('message', async (ctx) => {
            await ctx.replyWithMarkdown(`*Это не похоже на номер телефона*`)
        })
        return sPhone
    }

//     SearchScene () {
//         const sSearch = new Scenes.BaseScene('sSearch')
//         sSearch.enter(async (ctx) =>{
//             await ctx.replyWithMarkdownV2(`*Напишите ID пользователя цифрами*`,
//                 Markup.inlineKeyboard([
//                     Markup.button.callback('Отмена', 'cancel')
//                 ]))
//         })
//         sSearch.action('cancel', async (ctx) => {
//             await ctx.answerCbQuery()
//             await ctx.editMessageText('Поиск отменен.')
//             await ctx.scene.leave()
//         })
//         sSearch.on('text', async (ctx) => {
//             const searchId = Number(ctx.message.text)
//             if (searchId && searchId > 0) {
//                 const user = await profileUser(searchId, 'nocreate')
//                 if (!user) {
//                     await ctx.replyWithMarkdownV2(`*Пользователи не найдены*`,
//                         Markup.inlineKeyboard([
//                             Markup.button.callback('⏪️ Админ панель', `adminPanel`)
//                         ]))
//                 } else {
//                     await ctx.replyWithMarkdownV2(`*Найденые пользователи:*`,
//                         Markup.inlineKeyboard([
//                             Markup.button.callback(`${searchId}`, `info:${searchId}:1`)
//                         ]))
//                 }
//                 await ctx.scene.leave()
//             } else {
//                 await ctx.replyWithMarkdown(`*ID пользователя не распознан*`)
//                 await ctx.scene.reenter()
//             }
//         })
//         sSearch.on('message', async (ctx) => {
//             await ctx.replyWithMarkdown(`*Это не похоже на ID пользователя*`)
//         })
//         return sSearch
//     }
//
//     NewPromoScene () {
//         const selectType = new Composer()
//         selectType.on('text', async (ctx) => {
//             ctx.wizard.state.code = ctx.message.text
//             await ctx.replyWithMarkdownV2(`*Введи тип промокода*
//
// Скидка в процентах \`sale\`, скидка в рублях \`rub\` или Срок бесплатного доступа \`day\``,
//                 Markup.inlineKeyboard([
//                     Markup.button.callback('Отмена', 'cancel')
//                 ]))
//             return ctx.wizard.next()
//         })
//
//         const enterMeaning = new Composer()
//         enterMeaning.on('text', async (ctx) => {
//             const validValues = ['sale', 'rub', 'day']
//             const userType = ctx.message.text.toLowerCase()
//
//             if (validValues.includes(userType)) {
//                 ctx.wizard.state.type = userType
//                 await ctx.replyWithMarkdownV2(
//                     `*Укажите значение цифрами*\n\nЕсли это скидка в процентах, то процент скидки; если скидка в рублях, то сумму; если срок бесплатного доступа, то количество дней\\.`,
//                     Markup.inlineKeyboard([
//                         Markup.button.callback('Отмена', 'cancel')
//                     ])
//                 );
//                 return ctx.wizard.next()
//             } else {
//                 await ctx.replyWithMarkdownV2(
//                     '⚠️ Пожалуйста, введите одно из следующих значений\\: sale, rub, day\\.'
//                 )
//                 return ctx.wizard.selectStep(ctx.wizard.cursor)
//             }
//         })
//
//         const enterValidity = new Composer()
//         enterValidity.on('text', async (ctx) => {
//             const positiveIntegerRegex = /^[1-9]\d*$/
//             const userText = ctx.message.text
//
//             if (positiveIntegerRegex.test(userText)) {
//                 ctx.wizard.state.meaning = userText
//                 await ctx.replyWithMarkdownV2(
//                     '*Укажите срок действия промокода в днях цифрами*',
//                     Markup.inlineKeyboard([
//                         Markup.button.callback('Отмена', 'cancel')
//                     ])
//                 )
//                 return ctx.wizard.next()
//             } else {
//                 await ctx.replyWithMarkdownV2('⚠️ Пожалуйста, введите положительное целое число без ведущих нулей')
//                 return ctx.wizard.selectStep(ctx.wizard.cursor)
//             }
//         })
//
//         const preview = new Composer()
//         preview.on('text', async (ctx) => {
//             const positiveIntegerRegex = /^[1-9]\d*$/
//             const userText = ctx.message.text
//
//             if (positiveIntegerRegex.test(userText)) {
//
//                 ctx.wizard.state.validity = ctx.message.text
//                 await ctx.replyWithMarkdownV2(`*Ваш промокод:*
//
// *Код:* ${ctx.wizard.state.code}
// *Тип:* ${ctx.wizard.state.type}
// *Значение:* ${ctx.wizard.state.meaning}
// *Срок действия дней:* ${ctx.wizard.state.validity}`,
//                     Markup.inlineKeyboard([
//                         Markup.button.callback('Создать промокод', 'finalNewPromo')
//                     ], [
//                         Markup.button.callback('Отмена', 'cancel')
//                     ]))
//                 return ctx.wizard.next()
//             } else {
//                 await ctx.replyWithMarkdownV2('⚠️ Пожалуйста, введите положительное целое число без ведущих нулей')
//                 return ctx.wizard.selectStep(ctx.wizard.cursor)
//             }
//         })
//
//         const finalNewPromo = new Composer()
//         finalNewPromo.action('finalNewPromo', async (ctx) => {
//             const promo = await createPromo(ctx.wizard.state.code,ctx.wizard.state.type,ctx.wizard.state.meaning,ctx.wizard.state.validity)
//             if(!promo) {
//                 await ctx.replyWithMarkdownV2(`*Ошибка создания промокода\\. Возможно такой код уже существует*`,
//                     Markup.inlineKeyboard([
//                         Markup.button.callback('🏷‍ Промокоды', 'promoPage:1')
//                     ]))
//             } else {
//                 await ctx.replyWithMarkdownV2(`*Ваш промокод успешно создан*`,
//                     Markup.inlineKeyboard([
//                         Markup.button.callback('🏷‍ Промокоды', 'promoPage:1')
//                     ]))
//             }
//             return ctx.scene.leave()
//         })
//
//
//         const sNewPromo = new Scenes.WizardScene('sNewPromo', selectType, enterMeaning, enterValidity, preview, finalNewPromo)
//
//         sNewPromo.enter( async (ctx) => {
//             await ctx.replyWithMarkdownV2(`*Напишите код промокода*`,
//                 Markup.inlineKeyboard([
//                     Markup.button.callback('Отмена', 'cancel')
//                 ]))
//         })
//
//         sNewPromo.action('cancel', async (ctx) => {
//             await ctx.answerCbQuery()
//             await ctx.editMessageText('Создание промокода отменено.')
//             await ctx.scene.leave()
//         })
//
//         return sNewPromo
//     }

}

export const scene = new Scene()