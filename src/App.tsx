import React from 'react';
import { useMQTTStore } from './store/mqttStore';
import ConnectionForm from './components/ConnectionForm';
import SubscriptionForm from './components/SubscriptionForm';
import SubscriptionList from './components/SubscriptionList';
import TopicTree from './components/TopicTree';
import { PowerIcon } from 'lucide-react';

function App() {
  const { connect, disconnect, subscribe, unsubscribe, connected, topicTree, subscriptions } = useMQTTStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ConnectionForm onConnect={connect} isConnected={connected} />
            
            {connected && (
              <div className="mt-4">
                <button
                  onClick={disconnect}
                  className="inline-flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <PowerIcon className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {connected && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Subscribe to Topics</h2>
                <SubscriptionForm onSubscribe={subscribe} />
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Active Subscriptions</h3>
                  <SubscriptionList 
                    subscriptions={subscriptions} 
                    onUnsubscribe={unsubscribe} 
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Topic Tree</h2>
                <div className="max-h-[500px] overflow-y-auto">
                  <TopicTree node={topicTree} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;