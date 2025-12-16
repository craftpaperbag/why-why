'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomNode = ({ data, isConnectable }: NodeProps) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-slate-200 min-w-[150px]">
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <div className="font-bold text-xs text-slate-500 mb-1">
                {data.label ? 'Cause/Problem' : 'New Node'}
            </div>
            <input
                className="nodrag w-full text-sm font-medium text-slate-900 focus:outline-none bg-transparent"
                value={data.label}
                onChange={(evt) => data.onChange(evt.target.value)}
                placeholder="Enter text..."
            />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
        </div>
    );
};

export default memo(CustomNode);
