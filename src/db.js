import { PrismaClient } from '@prisma/client'
import { addSubSeconds, dayToSeconds, nowTimeSecond} from './utils.js'
const db = new PrismaClient()

export async function createUser(userID,userName) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId: userID }})
        if (!userExists) {
            const sub = addSubSeconds(3)
            await db.user.create({
                data: {
                    telegramId: userID,
                    name: userName,
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

export async function profileUser(userID, name) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId: userID }})
        if (!userExists) { await createUser(userID, name) }
        return await db.user.findUnique({ where: { telegramId: userID }})
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
        await db.$connect()
        const user = await profileUser(userID, name)
        const addSubTime = dayToSeconds(days) + Number(user.subscribe)
        await db.user.update({
            where: {
                telegramId: userID
            },
            data: {
                subscribe: addSubTime
            },
        })
    } catch (error) {
        console.error('Ошибка продления подписки:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}