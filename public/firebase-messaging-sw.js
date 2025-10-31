/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBPfeAANaHwB9kcPXKAv8YqKLvPBDVVkYA",
  authDomain: "mern-blog-76ba3.firebaseapp.com",
  projectId: "mern-blog-76ba3",
  storageBucket: "mern-blog-76ba3.firebasestorage.app",
  messagingSenderId: "283067116065",
  appId: "1:283067116065:web:8d7a4cb3eaaaf8bad51160",
  measurementId: "G-DH9VW6MGY3",
});

const messaging = firebase.messaging();

// ✅ Let FCM handle showing notifications automatically
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);
  // Do not call showNotification here — Firebase already handles it
});

// ✅ Keep your notification click handler (it’s good)
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
