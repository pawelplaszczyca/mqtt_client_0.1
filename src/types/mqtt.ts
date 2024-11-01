export interface MQTTConnection {
  url: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  protocol: 'mqtt' | 'ws';
  secure: boolean;
}

export interface TopicStats {
  messageCount: number;
  lastMessage?: string;
  lastUpdate?: Date;
}

export interface TopicNode {
  name: string;
  fullPath: string;
  stats: TopicStats;
  children: Map<string, TopicNode>;
}

export interface Subscription {
  topic: string;
  qos: 0 | 1 | 2;
}