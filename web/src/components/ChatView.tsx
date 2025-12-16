'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Edge, Node } from 'reactflow';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
}

interface ChatViewProps {
    nodes: Node[];
    edges: Edge[];
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function ChatView({ nodes, edges, setNodes, setEdges }: ChatViewProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'model', content: 'こんにちは。どのようなことでお困りですか？' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare graph context (lightweight version)
            const graphContext = {
                nodes: nodes.map(n => ({ id: n.id, label: n.data.label, parentId: n.parentNode })),
                edges: edges.map(e => ({ source: e.source, target: e.target }))
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    graphContext
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Add AI message
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: data.response || 'すみません、エラーが発生しました。'
            };
            setMessages((prev) => [...prev, aiMessage]);

            // Update Graph
            if (data.graph_updates) {
                if (data.graph_updates.add_nodes) {
                    const newNodes = data.graph_updates.add_nodes.map((n: any) => ({
                        id: n.id,
                        type: 'custom', // Important to use custom type
                        position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position for now, or calculate layout
                        data: { label: n.label }
                    }));

                    // Simple layouting logic: place new nodes below parent or randomly
                    // For a proper tree, we'd need D3 or Dagre. 
                    // For now, let's just add them and let user drag, or offset them slightly.

                    setNodes((prev) => {
                        // Avoid duplicates
                        const uniqueNewNodes = newNodes.filter((nn: any) => !prev.some(pn => pn.id === nn.id));
                        return [...prev, ...uniqueNewNodes];
                    });
                }
                if (data.graph_updates.add_edges) {
                    const newEdges = data.graph_updates.add_edges.map((e: any) => ({
                        id: `e${e.source}-${e.target}`,
                        source: e.source,
                        target: e.target
                    }));
                    setEdges((prev) => {
                        const uniqueNewEdges = newEdges.filter((ne: any) => !prev.some(pe => pe.source === ne.source && pe.target === ne.target));
                        return [...prev, ...uniqueNewEdges];
                    });
                }
            }

        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', content: 'エラーが発生しました。もう一度お試しください。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 rounded-tl-none animate-pulse">
                            考え中...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="ここに相談内容を入力..."
                        className="w-full px-4 py-3 pr-12 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
