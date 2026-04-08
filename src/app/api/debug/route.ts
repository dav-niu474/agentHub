import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    const userCount = await prisma.user.count()
    const msgCount = await prisma.chatMessage.count()
    await prisma.$disconnect()

    return NextResponse.json({
      status: 'connected',
      userCount,
      messageCount: msgCount,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    }, { status: 500 })
  }
}
