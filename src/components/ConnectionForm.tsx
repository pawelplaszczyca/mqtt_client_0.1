import React, { useState } from 'react';
import { WifiIcon, AlertCircleIcon } from 'lucide-react';
import { MQTTConnection } from '../types/mqtt';

interface ConnectionFormProps {
  onConnect: (config: MQTTConnection) => Promise<void>;
  isConnected: boolean;
}

const DEFAULT_PORTS = {
  ws: 443,
  mqtt: 8883
};

export default function ConnectionForm({ onConnect, isConnected }: ConnectionFormProps) {
  const [config, setConfig] = useState<MQTTConnection>({
    url: 'test.mosquitto.org',
    port: DEFAULT_PORTS.ws,
    clientId: `mqtt-client-${Math.random().toString(16).substring(2, 10)}`,
    protocol: 'ws',
    secure: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [portInput, setPortInput] = useState(config.port.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onConnect(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to broker');
    }
  };

  const handleProtocolChange = (protocol: 'mqtt' | 'ws') => {
    const newPort = DEFAULT_PORTS[protocol];
    setPortInput(newPort.toString());
    setConfig(prev => ({
      ...prev,
      protocol,
      port: newPort
    }));
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPortInput(value);
    
    const port = parseInt(value);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      setConfig(prev => ({ ...prev, port }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <WifiIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">MQTT Connection</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
          <AlertCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Protocol</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={config.protocol}
              onChange={(e) => handleProtocolChange(e.target.value as 'mqtt' | 'ws')}
            >
              <option value="ws">WebSocket (WSS)</option>
              <option value="mqtt">MQTT (MQTTS)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="number"
              min="1"
              max="65535"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={portInput}
              onChange={handlePortChange}
              onBlur={() => {
                if (!portInput || parseInt(portInput) <= 0) {
                  const defaultPort = DEFAULT_PORTS[config.protocol];
                  setPortInput(defaultPort.toString());
                  setConfig(prev => ({ ...prev, port: defaultPort }));
                }
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Broker URL</label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={config.url}
            onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
            placeholder="test.mosquitto.org"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the domain without protocol (e.g., test.mosquitto.org)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={config.clientId}
            onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username (optional)</label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={config.username || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value || undefined }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
          <input
            type="password"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={config.password || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value || undefined }))}
          />
        </div>

        <button
          type="submit"
          disabled={isConnected}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isConnected ? 'Connected' : 'Connect'}
        </button>
      </div>
    </form>
  );
}