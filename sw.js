// Service Worker for Study Assistant Chat
// Enables offline functionality, caching, and PWA features

const CACHE_NAME = 'study-assistant-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/chat-modern.html',
    '/css/common.css',
    '/css/components.css',
    '/css/utilities.css',
    '/css/responsive.css',
    '/css/chat-modern.css',
    '/js/chat-advanced.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    '/favicon.ico',
    '/apple-touch-icon.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Only cache GET requests, skip POST, HEAD, and other methods
    if (event.request.method !== 'GET') {
        // For non-GET requests, just fetch from network without caching
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(
                    response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle background sync for offline messages
self.addEventListener('sync', event => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            // Sync offline messages when back online
            syncOfflineMessages()
        );
    }
});

// Function to sync offline messages
async function syncOfflineMessages() {
    try {
        // Get offline messages from IndexedDB
        const offlineMessages = await getOfflineMessages();
        
        // Send each message to the server
        for (const message of offlineMessages) {
            try {
                await sendMessageToServer(message);
                // Remove from offline storage after successful sync
                await removeOfflineMessage(message.id);
            } catch (error) {
                console.error('Failed to sync message:', error);
            }
        }
    } catch (error) {
        console.error('Error syncing messages:', error);
    }
}

// Mock functions for IndexedDB operations
function getOfflineMessages() {
    return new Promise((resolve) => {
        // In a real implementation, this would query IndexedDB
        resolve([]);
    });
}

function removeOfflineMessage(messageId) {
    return new Promise((resolve) => {
        // In a real implementation, this would remove from IndexedDB
        resolve();
    });
}

function sendMessageToServer(message) {
    return new Promise((resolve, reject) => {
        // In a real implementation, this would send to your API
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

// Handle push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/apple-touch-icon.png',
            badge: '/favicon.ico',
            tag: 'chat-notification',
            renotify: true,
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: '打开聊天'
                },
                {
                    action: 'dismiss',
                    title: '忽略'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/chat-modern.html')
        );
    }
});

// Message handling from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});