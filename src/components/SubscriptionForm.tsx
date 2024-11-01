import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';

interface SubscriptionFormProps {
  onSubscribe: (topic: string, qos: 0 | 1 | 2) => void;
}

export default function SubscriptionForm({ onSubscribe }: SubscriptionFormProps) {
  const [topic, setTopic] = useState('');
  const [qos, setQos] = useState<0 | 1 | 2>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic) {
      onSubscribe(topic, qos);
      setTopic('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Topic (e.g., sensors/+/temperature)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <select
        value={qos}
        onChange={(e) => setQos(parseInt(e.target.value) as 0 | 1 | 2)}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value={0}>QoS 0</option>
        <option value={1}>QoS 1</option>
        <option value={2}>QoS 2</option>
      </select>
      <button
        type="submit"
        className="inline-flex items-center gap-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusIcon className="w-4 h-4" />
        Subscribe
      </button>
    </form>
  );
}