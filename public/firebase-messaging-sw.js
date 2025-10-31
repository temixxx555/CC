/* eslint-disable no-undef */
// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBPfeAANaHwB9kcPXKAv8YqKLvPBDVVkYA",
  authDomain: "mern-blog-76ba3.firebaseapp.com",
  projectId: "mern-blog-76ba3",
  storageBucket: "mern-blog-76ba3.firebasestorage.app",
  messagingSenderId: "283067116065",
  appId: "1:283067116065:web:8d7a4cb3eaaaf8bad51160",
  measurementId: "G-DH9VW6MGY3"
});

// Initialize FCM
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message.",
    icon: payload.notification?.icon || "/logo.png",
    data: { url: payload.fcmOptions?.link || "/" },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
