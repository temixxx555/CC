import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY =
  "BCLx7jpnfBB78HQCfQBXyvIYFRqca30qFXAxE3yx9_1-Lf1tJVpJzBtr5zgOspyNx_ko5Ozbt1xszEYL1BJuLOM";

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("FCM token:", token);
    return token;
  } else {
    console.warn("Permission not granted for notifications.");
    return null;
  }
}

export function onForegroundMessage() {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);

    const title =
      payload.notification?.title || payload.data?.title || "Notification";
    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new message.";
    const icon =
      payload.notification?.icon || payload.data?.icon || "/logo.png";
    const url =
      payload.fcmOptions?.link ||
      payload.data?.url ||
      "https://campus-connect.xyz/"; // ✅ your target link

    if (Notification.permission === "granted") {
      const notification = new Notification(title, { body, icon });

      // Handle click
      notification.onclick = (event) => {
        event.preventDefault();
        window.open(url, "_blank"); // ✅ Opens in new tab
      };
    } else {
      console.warn("Notifications are not permitted by the user");
    }
  });
}
