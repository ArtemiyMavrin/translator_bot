import config from 'config'
import axios from 'axios'
import EasyYandexS3 from 'easy-yandex-s3'
import stream from 'stream'



class SpeechKit {

    constructor(apiKey,idKey,accessKey,backetName) {
        if (!apiKey || !idKey || !accessKey || !backetName) {
            throw new Error('Недостаточно аргументов для создания экземпляра класса SpeechKit')
        }

        this.apiKey = apiKey
        this.idKey = idKey
        this.accessKey = accessKey
        this.backetName = backetName
        this.urlSynthesize = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"
        this.urlRecognize = "https://transcribe.api.cloud.yandex.net/speech/stt/v2/longRunningRecognize"

        this.s3 = new EasyYandexS3({
            auth: {
                accessKeyId: this.idKey,
                secretAccessKey: this.accessKey,
            },
            Bucket: this.backetName
        })

    }


    async uploadVoice (voiceStream, fileName) {

        try {
            const passThroughStream = new stream.PassThrough()
            voiceStream.pipe(passThroughStream)
            const upload = await this.s3.Upload(
                {
                    buffer: passThroughStream,
                    name: `${fileName}.ogg`
                },
                '/voices/'
            )
            return upload.Location
        } catch (error) {
            console.error('Ошибка Загрузки Ogg файла на сервер: ', error.message)
            throw new Error('Ошибка Загрузки Ogg файла на сервер')
        }

    }

    async voiceToMessage(voiceLink, voiceId) {
        try {
            const response = await axios({
                method: 'get',
                url: voiceLink,
                responseType: "stream"
            })
            const voiceStream = response.data
            const voiceUrl = await this.uploadVoice(voiceStream, voiceId)
            const body = {
                "config": {
                    "specification": {
                        "languageCode": "ru-RU",
                        "literature_text": "true"
                    }
                },
                "audio": {
                    "uri": `${voiceUrl}`
                }
            }
            const header = {
                Authorization: "Api-Key " + this.apiKey
            }
            const recognitionResponse = await axios.post(this.urlRecognize, body, { headers: header })
                .catch((error) => {
                    console.error('Ошибка отправки файла на сервер для распознавания:', error.message)
                    throw error
                })
            const id = recognitionResponse.data.id
            const transcriptionChunks = []
            while (true) {
                const statusResponse = await axios.get(`https://operation.api.cloud.yandex.net/operations/${id}`, { headers: header })
                    .catch((error) => {
                        console.error('Ошибка получения ответа от сервера распознания:', error)
                        throw error
                    })
                const req = statusResponse.data
                if (req.done) {
                    if (req.response.chunks.length > 0) {
                        req.response.chunks.forEach((chunk) => {
                            const text = chunk.alternatives[0].text
                            transcriptionChunks.push(text)
                        })
                    }
                    break
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                }
            }
            await this.s3.Remove(`/voices/${voiceId}.ogg`)
            return transcriptionChunks.join(' ')
        } catch (error) {
            console.error('Ошибка Распознавания речи: ', error.message)
            throw new Error('Ошибка Распознавания речи')
        }
    }

    async messageToVoice(text,voice) {
        try {
            const params = new URLSearchParams()
            params.append('text', text)
            params.append('lang', 'ru-RU')
            params.append('voice', voice)
            params.append('format', 'oggopus')
            params.append('emotion', 'good')
            params.append('speed', '1.0')

            const response = await axios({
                method: 'POST',
                url: this.urlSynthesize,
                responseType: 'stream',
                headers: {
                    Authorization: "Api-Key " + this.apiKey,
                },
                data: params
            })

            return response.data

        } catch (error) {
            console.error('Ошибка синтеза речи ',error.message)
            throw new Error('Ошибка синтеза речи')
        }
    }

}

export const speechKit = new SpeechKit(config.get('YANDEX_CLOUD_API_KEY'),config.get('YANDEX_CLOUD_ID_KEY'),config.get('YANDEX_CLOUD_ACCESS_KEY'),config.get('BUCKET_NAME'))