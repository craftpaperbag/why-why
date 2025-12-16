'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

export default function TreeView({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes
}: {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: any;
    onEdgesChange: any;
    onConnect: any;
    setNodes: any;
}) {

    // Custom node handler logic depends on setNodes being passed or capable of update
    // The parent passes setNodes, so we can use it in the onChange
    const nodesWithHandlers = useMemo(() => {
        return nodes.map((node) => ({
            ...node,
            data: {
                ...node.data,
                onChange: (label: string) => {
                    setNodes((nds: any) =>
                        nds.map((n: any) => {
                            if (n.id === node.id) {
                                return { ...n, data: { ...n.data, label } };
                            }
                            return n;
                        })
                    );
                },
            },
        }));
    }, [nodes, setNodes]);

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
            <ReactFlow
                nodes={nodesWithHandlers}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
