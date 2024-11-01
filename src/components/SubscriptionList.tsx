import React from 'react';
import { Trash2Icon } from 'lucide-react';
import { Subscription } from '../types/mqtt';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onUnsubscribe: (topic: string) => void;
}

export default function SubscriptionList({ subscriptions, onUnsubscribe }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No active subscriptions
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subscriptions.map((sub) => (
        <div
          key={sub.topic}
          className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
        >
          <div>
            <span className="font-medium">{sub.topic}</span>
            <span className="ml-2 text-sm text-gray-500">QoS {sub.qos}</span>
          </div>
          <button
            onClick={() => onUnsubscribe(sub.topic)}
            className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
            title="Unsubscribe"
          >
            <Trash2Icon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}