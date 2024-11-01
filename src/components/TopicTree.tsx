import React from 'react';
import { FolderIcon, MessageSquareIcon } from 'lucide-react';
import { TopicNode } from '../types/mqtt';

interface TopicTreeProps {
  node: TopicNode;
  level?: number;
}

export default function TopicTree({ node, level = 0 }: TopicTreeProps) {
  const hasChildren = node.children.size > 0;
  const paddingLeft = level * 20;

  return (
    <div>
      {node.name !== 'root' && (
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {hasChildren ? (
            <FolderIcon className="w-4 h-4 text-blue-600" />
          ) : (
            <MessageSquareIcon className="w-4 h-4 text-green-600" />
          )}
          <span className="font-medium">{node.name}</span>
          {node.stats.messageCount > 0 && (
            <span className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {node.stats.messageCount} message{node.stats.messageCount !== 1 ? 's' : ''}
              </span>
              {node.stats.lastUpdate && (
                <span className="text-xs text-gray-400">
                  {new Date(node.stats.lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </span>
          )}
        </div>
      )}
      {hasChildren && (
        <div className="space-y-1">
          {Array.from(node.children.values()).map((child) => (
            <TopicTree key={child.fullPath} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}