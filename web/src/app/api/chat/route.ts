import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const { messages, graphContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        const aiResponseText = await generateAIResponse(messages, graphContext);

        try {
            const parsedResponse = JSON.parse(aiResponseText);
            return NextResponse.json(parsedResponse);
        } catch (e) {
            // Fallback if JSON parsing fails (or AI didn't return valid JSON)
            console.error("Failed to parse AI response as JSON", aiResponseText);
            return NextResponse.json({
                response: aiResponseText,
                graph_updates: { add_nodes: [], add_edges: [] }
            });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response', details: error.message },
            { status: 503 }
        );
    }
}
