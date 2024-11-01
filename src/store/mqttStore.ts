import { create } from 'zustand';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { MQTTConnection, TopicNode, TopicStats, Subscription } from '../types/mqtt';

interface MQTTStore {
  client: MqttClient | null;
  connected: boolean;
  topicTree: TopicNode;
  subscriptions: Subscription[];
  connect: (config: MQTTConnection) => Promise<void>;
  disconnect: () => void;
  subscribe: (topic: string, qos: 0 | 1 | 2) => void;
  unsubscribe: (topic: string) => void;
}

const createTopicNode = (name: string, fullPath: string): TopicNode => ({
  name,
  fullPath,
  stats: { messageCount: 0 },
  children: new Map(),
});

const updateTopicTree = (tree: TopicNode, topic: string, message: string) => {
  const parts = topic.split('/');
  let currentNode = tree;
  let currentPath = '';

  parts.forEach((part, index) => {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    if (!currentNode.children.has(part)) {
      currentNode.children.set(part, createTopicNode(part, currentPath));
    }
    
    currentNode = currentNode.children.get(part)!;
    
    if (index === parts.length - 1) {
      currentNode.stats.messageCount++;
      currentNode.stats.lastMessage = message;
      currentNode.stats.lastUpdate = new Date();
    }
  });
};

const buildMQTTConfig = (config: MQTTConnection): IClientOptions => {
  const baseConfig: IClientOptions = {
    clientId: config.clientId,
    keepalive: 30,
    connectTimeout: 10000,
    clean: true,
    reconnectPeriod: 0, // Disable auto-reconnect
  };

  if (config.username) {
    baseConfig.username = config.username;
  }

  if (config.password) {
    baseConfig.password = config.password;
  }

  if (config.protocol === 'ws') {
    return {
      ...baseConfig,
      protocol: 'wss',
      hostname: config.url,
      port: config.port,
      path: '/mqtt',
    };
  } else {
    return {
      ...baseConfig,
      protocol: 'mqtts',
      host: config.url,
      port: config.port,
    };
  }
};

const getConnectionError = (error: any): string => {
  if (error.message.includes('ECONNREFUSED')) {
    return 'Connection refused. Please check if the broker is running and the port is correct.';
  }
  if (error.message.includes('Not authorized')) {
    return 'Authentication failed. Please check your username and password.';
  }
  if (error.message.includes('timeout')) {
    return 'Connection timed out. Please check your broker URL and port.';
  }
  if (error.message.includes('WebSocket')) {
    return 'WebSocket connection failed. Please check if the broker supports WebSocket connections on the specified port.';
  }
  return `Connection failed: ${error.message}`;
};

export const useMQTTStore = create<MQTTStore>((set, get) => ({
  client: null,
  connected: false,
  topicTree: createTopicNode('root', ''),
  subscriptions: [],
  
  connect: async (config: MQTTConnection) => {
    // Disconnect existing client if any
    const { client: existingClient } = get();
    if (existingClient) {
      existingClient.end(true);
    }

    try {
      const mqttConfig = buildMQTTConfig(config);
      const client = mqtt.connect(mqttConfig);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.end(true);
          reject(new Error('Connection timeout'));
        }, 10000);

        client.on('connect', () => {
          clearTimeout(timeout);
          set({ client, connected: true });
          resolve();
        });

        client.on('message', (topic, message) => {
          const { topicTree } = get();
          updateTopicTree(topicTree, topic, message.toString());
          set({ topicTree: { ...topicTree } });
        });

        client.on('error', (err) => {
          clearTimeout(timeout);
          client.end(true);
          reject(new Error(getConnectionError(err)));
        });

        client.on('close', () => {
          set({ connected: false, subscriptions: [], client: null });
        });

        client.on('disconnect', () => {
          set({ connected: false, subscriptions: [], client: null });
        });

        client.on('offline', () => {
          set({ connected: false, subscriptions: [], client: null });
        });
      });
    } catch (error) {
      throw new Error(getConnectionError(error));
    }
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.end(true);
      set({ client: null, connected: false, subscriptions: [], topicTree: createTopicNode('root', '') });
    }
  },

  subscribe: (topic: string, qos: 0 | 1 | 2) => {
    const { client, subscriptions } = get();
    if (client && client.connected) {
      client.subscribe(topic, { qos }, (err) => {
        if (!err) {
          set({ subscriptions: [...subscriptions, { topic, qos }] });
        }
      });
    }
  },

  unsubscribe: (topic: string) => {
    const { client, subscriptions } = get();
    if (client && client.connected) {
      client.unsubscribe(topic, undefined, (err) => {
        if (!err) {
          set({ 
            subscriptions: subscriptions.filter(sub => sub.topic !== topic)
          });
        }
      });
    }
  },
}));