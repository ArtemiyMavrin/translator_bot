import { PrismaClient } from '@prisma/client'
import { addSubSeconds, dayToSeconds, nowTimeSecond } from './utils.js'

const db = new PrismaClient()

export async function createUser(telegramId,name,tgUser) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId }})
        if (!userExists) {
            const sub = addSubSeconds(1)
            await db.user.create({
                data: {
                    telegramId,
                    name,
                    tgUser,
                    subscribe: sub
                },
            })
        }
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function profileUser(telegramId, name, username) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId }})
        if (!userExists) { await createUser(telegramId, name, username) }
        return await db.user.findUnique({ where: { telegramId }})
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function checkSubscribe(userID, name) {
    try {
        await db.$connect()
        const nowTime = nowTimeSecond()
        const user = await profileUser(userID, name)
        const check = Number(user.subscribe) - nowTime
        return check > 0
    } catch (error) {
        console.error('Ошибка получения данных подписки пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function subscribePay(userID, name, days) {
    try {
        const telegramId = BigInt(userID)
        await db.$connect()
        await db.user.update({
            where: {
                telegramId
            },
            data: {
                subscribe: {
                    increment: dayToSeconds(days)
                }
            },
        })
    } catch (error) {
        console.error('Ошибка продления подписки:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function allUser(offset, ITEMS_PER_PAGE) {
    try {
        await db.$connect()
        return await db.user.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
        })
    } catch (error) {
        console.error('Ошибка получения списка пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function countUser() {
    try {
        await db.$connect()
        return await db.user.count()
    } catch (error) {
        console.error('Ошибка получения количества пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function createVoice( voice, language, languageCode, gender, characterRoles ) {
    try {
        await db.$connect()
        await db.voice.create({
            data: {
                language,
                languageCode,
                voice,
                gender,
                characters: {
                    connectOrCreate: characterRoles.map((role) => ({
                        where: { role: role.value },
                        create: {
                            role: role.value,
                            name: role.name
                        },
                    })),
                },
            },
        })

    } catch (error) {
        console.error('Не удалось создать голос:', error)
    } finally {
        await db.$disconnect()
    }

}

export async function allLanguage() {
    try {
        await db.$connect()
        return await db.voice.findMany({
            distinct: ['language'],
            select: {
                language: true,
                languageCode: true
            }
        })
    } catch (error) {
        console.error('Ошибка получения списка языков:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function allVoice(languageCode) {
    try {
        await db.$connect()
        return await db.voice.findMany({
            where: {
                languageCode
            }
        })
    } catch (error) {
        console.error('Ошибка получения списка языков:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function allCharacter(voice) {
    try {
        await db.$connect()
        return await db.character.findMany({
            where: {
                voices: {
                    some: {
                        voice: {
                            contains: voice,
                        }
                    }
                }
            }
        })
    } catch (error) {
        console.error('Ошибка получения списка амплуа:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function updateSettingUser(voice, character, ctx) {
    try {
        await db.$connect()
        await db.user.update({
            where: {
                telegramId: ctx.from.id
            },
            data: {
                voice,
                character
            },
        })
        await ctx.deleteMessage()
        await ctx.replyWithMarkdown(`Настройки голоса успешно изменены.`)

    } catch (error) {
        console.error('Ошибка записи настроек пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}