import config from 'config'
import {Markup} from "telegraf";
import {subscribePay} from "../db.js";

const ytoken = config.get('Y_KASSA_TOKEN')
const price = config.get('ONE_PRICE')
const supportMessage = config.get('SUPPORT_MESSAGE')

const getInvoice = (id) => {
    const invoice = {
        chat_id: id,
        title: 'Оплата подписки',
        description: 'Подписка Translator BOT — 30 дней',
        payload: {
            date: new Date(),
            user_id: id,
            provider: 'Ю-касса',
            bot: 'Translator_Bot'
        },
        provider_token: ytoken,
        start_parameter: 'pay',
        currency: 'RUB',
        prices: [{ label: '₽', amount: price * 100 }],

    }

    return invoice
}

export const handlePay = async (ctx) => {
    try {
        return ctx.replyWithInvoice(getInvoice(ctx.from.id))
    }catch (e) {
        await ctx.reply(`Платежная система времнно недоступна.\n` +
            'Попробуйте позже или свяжитесь с поддержкой бота')
        await ctx.reply(supportMessage)
    }
}

export const successfulPayment = async (ctx) => {
    await subscribePay(ctx.from.id, ctx.from.first_name,30)
    await ctx.reply('Подписка оплачена ✅ \n\n ' +
        'Вы можете проверить срок действия подписки в профиле',
        Markup.inlineKeyboard([Markup.button.callback(`👤 Открыть профиль`, 'profile')]))
}