'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  addEdge,
  Connection
} from 'reactflow';
import ChatView from '@/components/ChatView';
import TreeView from '@/components/TreeView';
import CustomNode from '@/components/CustomNode';

// Define initial state here so it's loaded once
const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: '困りごとは何ですか？' } },
];
const initialEdges: Edge[] = [];

export default function Home() {
  // Lift state up
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <main className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-slate-50">
      <ReactFlowProvider>
        <div className="flex-1 h-1/2 md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-slate-700">Chat</h2>
          {/* Pass state setters to ChatView */}
          <ChatView
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        </div>

        <div className="flex-1 h-1/2 md:h-full md:w-1/2 p-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-slate-700">Why-Why Tree</h2>
          <TreeView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            setNodes={setNodes}
          />
        </div>
      </ReactFlowProvider>
    </main>
  );
}
