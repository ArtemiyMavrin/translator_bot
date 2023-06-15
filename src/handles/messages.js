import { checkSubscribe } from '../db.js'
import { replaySubscribe } from '../utils.js'
import { speechKit } from '../speechkit.js'

export const handleMessageText = async (ctx) => {
    try {
        ctx.session ??= { voice: 'ermil' }
        const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
        if(!checkPay) { return replaySubscribe(ctx) }
        const text = ctx.message.text
        const { message_id } = await ctx.reply('Обработка...', {
            reply_to_message_id: ctx.message.message_id
        })
        const voiceMessage = await speechKit.messageToVoice(text, ctx.session.voice)

        await ctx.replyWithVoice({ source: voiceMessage }, {
            reply_to_message_id: ctx.message.message_id
        })

        await ctx.deleteMessage(message_id)
    } catch (e) {
        console.log('Ошибка обработки текстового сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке текстового сообщения')
    }
}

export const handleMessageVoice = async (ctx) => {
    try {
        const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
        if(!checkPay) { return replaySubscribe(ctx) }

        const voice = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const voiceId = String(ctx.message.from.id) + String(ctx.message.message_id)
        const { message_id } = await ctx.reply('Обработка...', {
            reply_to_message_id: ctx.message.message_id
        })
        const text = await speechKit.voiceToMessage(voice, voiceId)

        await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, text, {
            reply_to_message_id: ctx.message.message_id
        })
    } catch (e) {
        console.log('Ошибка обработки голосового сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке голосового сообщения')
    }
}