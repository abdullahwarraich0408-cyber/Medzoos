import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const NOTIFICATION_CHANNEL_ID = 'medcare_default';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  await notifee.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'MedCare Alerts',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  const title =
    remoteMessage.notification?.title ||
    (typeof remoteMessage.data?.title === 'string'
      ? remoteMessage.data.title
      : 'MedCare');
  const body =
    remoteMessage.notification?.body ||
    (typeof remoteMessage.data?.body === 'string'
      ? remoteMessage.data.body
      : 'You have a new update.');

  await notifee.displayNotification({
    id: remoteMessage.messageId || `${Date.now()}`,
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId: NOTIFICATION_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
    },
  });
});
