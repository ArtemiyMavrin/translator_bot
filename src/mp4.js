import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

class mp4Converter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    toOgg(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.ogg`)
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                    .output(outputPath)
                    .format('ogg')
                    .audioCodec('libopus')
                    .on('end', () => resolve(outputPath))
                    .on('error', (err) => reject(err.message))
                    .run()
            })
        } catch (e) {
            console.log('Ошибка конвертации в ogg', e.message)
        }
    }

    async create(url, filename) {
        try {
            const mp4Path = resolve(__dirname, '../temp', `${filename}.mp4`)
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            })
            return new Promise((resolve) => {
                const stream = createWriteStream(mp4Path)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(mp4Path))
            })
        } catch (e) {
            console.log('Ошибка сохранения видео', e.message)
        }
    }
}

export const mp4 = new mp4Converter()