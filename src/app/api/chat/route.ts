import { NextRequest, NextResponse } from 'next/server';
import { createAnythingLLMClient } from '@/services/anythingllm';
import type { ChatMessage } from '@/services/anythingllm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, metadata } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create client with server-side environment variables
    const client = createAnythingLLMClient();

    const response = await client.chat({
      messages: messages as ChatMessage[],
      metadata,
      stream: false,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const assistantContent = response.choices[0]?.message?.content || 'No response';

    return NextResponse.json({
      content: assistantContent,
      usage: response.usage,
    });

  } catch (error) {
    console.error('[API/chat] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode || 500 }
    );
  }
}