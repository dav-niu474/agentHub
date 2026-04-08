import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULT_USER_ID = 'default-user'

// POST - Save a chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentInstanceId, role, content, messageType } = body

    if (!agentInstanceId || typeof agentInstanceId !== 'string') {
      return NextResponse.json(
        { error: 'agentInstanceId is required' },
        { status: 400 }
      )
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be one of: user, assistant, system' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    // Ensure the default user exists
    await db.user.upsert({
      where: { id: DEFAULT_USER_ID },
      update: {},
      create: {
        id: DEFAULT_USER_ID,
        email: 'default@agenthub.local',
        name: 'Default User',
      },
    })

    const message = await db.chatMessage.create({
      data: {
        userId: DEFAULT_USER_ID,
        agentInstanceId,
        role,
        content,
        messageType: messageType || 'text',
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Failed to save chat message:', error)
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    )
  }
}

// GET - Load chat messages for an agent instance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentInstanceId = searchParams.get('agentInstanceId')

    if (!agentInstanceId) {
      return NextResponse.json(
        { error: 'agentInstanceId query parameter is required' },
        { status: 400 }
      )
    }

    const messages = await db.chatMessage.findMany({
      where: {
        agentInstanceId,
        userId: DEFAULT_USER_ID,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to load chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to load chat messages' },
      { status: 500 }
    )
  }
}

// DELETE - Clear chat messages for an agent instance
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentInstanceId } = body

    if (!agentInstanceId || typeof agentInstanceId !== 'string') {
      return NextResponse.json(
        { error: 'agentInstanceId is required' },
        { status: 400 }
      )
    }

    const result = await db.chatMessage.deleteMany({
      where: {
        agentInstanceId,
        userId: DEFAULT_USER_ID,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Failed to clear chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat messages' },
      { status: 500 }
    )
  }
}
