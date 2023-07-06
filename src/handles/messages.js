import { checkSubscribe } from '../db.js'
import { replaySubscribe } from '../utils.js'
import { speechKit } from '../speechkit.js'
import { mp4 } from '../mp4.js'
import { removeFile } from '../utils.js'

export const handleMessageText = async (ctx) => {
    try {
        ctx.session ??= { voice: 'ermil' }
        const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
        if(!checkPay) { return replaySubscribe(ctx) }
        const text = ctx.message.text ?? ctx.message.caption ?? 'Интересно. Но для озвучки мне нужен текст! Я не могу озвучить фотографию'
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
        const voiceUrl = await speechKit.uploadUrlVoice(voice, voiceId)
        try {
            const text = await speechKit.voiceToMessage(voiceUrl, voiceId)
            await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, text, {
                reply_to_message_id: ctx.message.message_id
            })
        } catch (e) {
            if (e.message === 'Cannot read properties of undefined (reading \'length\')') {
                await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, 'Кажется, в аудиосообщении нет слов 🤷‍♂️', {
                    reply_to_message_id: ctx.message.message_id
                })
            }
        }
    } catch (e) {
        console.log('Ошибка обработки голосового сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке голосового сообщения')
    }
}

export const handleMessageVideoNote = async (ctx) => {
    try {
        const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
        if(!checkPay) { return replaySubscribe(ctx) }
        const video = await ctx.telegram.getFileLink(ctx.message.video_note.file_id)
        const fileId = String(ctx.message.from.id) + String(ctx.message.message_id)
        const { message_id } = await ctx.reply('Обработка...', {
            reply_to_message_id: ctx.message.message_id
        })
        const videoUri = await mp4.create(video,fileId)
        const voiceUri = await mp4.toOgg(videoUri,fileId)
        const voice = await speechKit.uploadLocalVoice(voiceUri, fileId)
        try {
            const text = await speechKit.voiceToMessage(voice, fileId)
            await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, text, {
                reply_to_message_id: ctx.message.message_id
            })
        } catch (e) {
            if (e.message === 'Cannot read properties of undefined (reading \'length\')') {
                await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0, 'Кажется, в видеосообщении нет слов 🤷‍♂️', {
                    reply_to_message_id: ctx.message.message_id
                })
            }
        }
        await removeFile(videoUri)
        await removeFile(voiceUri)
    } catch (e) {
        console.log('Ошибка обработки видео сообщения', e.message)
        await ctx.reply('Произошла ошибка при обработке видео сообщения')
    }
}