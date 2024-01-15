import { PrismaClient } from '@prisma/client'
import { addSubSeconds, dayToSeconds, nowTimeSecond} from './utils.js'
const db = new PrismaClient()

export async function createUser(userID,userName) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId: userID }})
        if (!userExists) {
            const sub = addSubSeconds(1)
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
        const telegramId = BigInt(userID)
        await db.$connect()
        await db.user.update({
            where: {
                telegramId: telegramId
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