import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DEFAULT_USER_ID = 'default-user'
const WORKSPACE_INSTANCE_ID = 'workspace-default'

// POST - Save a workspace message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, content, phase } = body

    if (!role || typeof role !== 'string') {
      return NextResponse.json(
        { error: 'role is required' },
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
        agentInstanceId: WORKSPACE_INSTANCE_ID,
        role,
        content,
        messageType: phase ? `phase-${phase}` : 'text',
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Failed to save workspace message:', error)
    return NextResponse.json(
      { error: 'Failed to save workspace message' },
      { status: 500 }
    )
  }
}

// GET - Load workspace messages
export async function GET() {
  try {
    const messages = await db.chatMessage.findMany({
      where: {
        agentInstanceId: WORKSPACE_INSTANCE_ID,
        userId: DEFAULT_USER_ID,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to load workspace messages:', error)
    return NextResponse.json(
      { error: 'Failed to load workspace messages' },
      { status: 500 }
    )
  }
}

// DELETE - Clear workspace messages
export async function DELETE() {
  try {
    const result = await db.chatMessage.deleteMany({
      where: {
        agentInstanceId: WORKSPACE_INSTANCE_ID,
        userId: DEFAULT_USER_ID,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Failed to clear workspace messages:', error)
    return NextResponse.json(
      { error: 'Failed to clear workspace messages' },
      { status: 500 }
    )
  }
}
