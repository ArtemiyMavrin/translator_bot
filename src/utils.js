import { Markup } from 'telegraf'
import config from 'config'
import { unlink } from 'fs/promises'

const price = config.get('ONE_PRICE')

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (e) {
        console.log('Error while removing file', e.message)
    }
}

export function nowTimeSecond() {
    const currentDate = new Date()
    return Math.floor(currentDate.getTime() / 1000)
}

export function convertSeconds(totalSeconds) {
    const days = Math.floor(totalSeconds / (60 * 60 * 24))
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)

    return `Активна ✅
Осталось: ${days} дней, ${hours}часов, ${minutes}минут`
}

export function addSubSeconds(days) {
    return nowTimeSecond() + (days * 24 * 60 * 60)
}

export function dayToSeconds(days) {
    return days * 24 * 60 * 60
}

export function subscribeDay(totalSeconds) {
    const now = nowTimeSecond()
    if(totalSeconds > now) {
        const day = Math.floor((Number(totalSeconds) - now) / (60 * 60 * 24))
        return `✅ ${day}д.`
    } else {
        return '❌'
    }
}

export async function replaySubscribe(ctx) {
    return await ctx.replyWithMarkdown(`*Бот не доступен*
    
Сейчас подписка — Не активна 😢
        
Ты можешь оформить подписку на бота прямо сейчас!`,
        Markup.inlineKeyboard([Markup.button.callback(`💳 Оформить подписку — за ${price}₽`, 'pay')])
    )
}