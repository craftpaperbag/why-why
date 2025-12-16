import { GoogleGenerativeAI } from '@google/generative-ai';

const GEN_AI_KEY = process.env.GOOGLE_API_KEY || '';
const USE_LOCAL_LLM = process.env.USE_LOCAL_LLM === 'true';
const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1';

const genAI = new GoogleGenerativeAI(GEN_AI_KEY);

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// System prompt to guide the AI
const SYSTEM_PROMPT = `
あなたは「なぜなぜ分析」のファシリテーターです。
ユーザーの困りごとに対して、原因を深掘りするための質問を投げかけてください。
また、会話の内容に基づいて、分析ツリー（グラフ）を更新するためのJSONデータを生成してください。

あなたは常にJSON形式で応答する必要があります。フォーマットは以下の通りです:

{
  "response": "ユーザーへの返答テキスト",
  "graph_updates": {
    "add_nodes": [
      { "id": "ユニークID", "label": "ノードのラベル", "parentId": "親ノードID (もしあれば)" }
    ],
    "add_edges": [
      { "source": "親ID", "target": "子ID", "label": "関係ラベル (任意)" }
    ]
  }
}

- 初回の相談では、まずは問題の定義を行い、ルートノードを作成してください。
- ユーザーの返答から新しい原因が判明したら、子ノードを追加してください。
- ノードIDは一意な短い文字列にしてください。
- 丁寧で共感的な口調で話してください。
`;

export async function generateAIResponse(messages: ChatMessage[], currentGraphContext: any) {
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));

    // Add system prompt and context to the last message or as a separate system instruction if supported
    // Gemini Pro 1.5 supports system instructions, but for broad compatibility we can prepend context.
    // For now, let's prepend the system prompt to the history or strictly enforce json mode.

    const contextMessage = `
Current Graph Context: ${JSON.stringify(currentGraphContext)}
${SYSTEM_PROMPT}
`;

    // For Gemini API, typical usage:
    // model.startChat({ history: ... })
    // But we want to enforce JSON.

    const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    // Construct history properly.
    // Note: Gemini implementation details might vary.
    // We'll wrap the main logic in a retry loop.

    return await retryOperation(async () => {
        if (USE_LOCAL_LLM) {
            // Mock local LLM call or implement fetch to Ollama/LocalAI
            throw new Error("Local LLM not implemented yet");
        } else {
            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: contextMessage }] }, // Pre-inject system prompt as first user message effectively
                    ...history.slice(0, -1) // Previous history
                ]
            });

            const lastMsg = history[history.length - 1];
            const result = await chat.sendMessage(lastMsg.parts[0].text);
            const response = result.response;
            return response.text();
        }
    });
}

async function retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries <= 0) throw error;
        console.warn(`AI request failed, retrying... (${retries} attempts left). Error:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryOperation(operation, retries - 1, delay * 2);
    }
}
