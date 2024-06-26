import NotificationBox from 'Components/notifications/NotificationBox';
import AuthContext from 'context/AuthContext';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { useContext, useEffect, useState } from 'react';

export interface NotificationProps {
  id: string;
  uid: string;
  url: string;
  isRead: string;
  content: string;
  createdAt: string;
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    if (user) {
      const ref = collection(db, 'notifications');
      const notificationQuery = query(
        ref,
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      onSnapshot(notificationQuery, (snapshot) => {
        const datas = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setNotifications(datas as NotificationProps[]);
      });
    }
  }, [user]);
  return (
    <div className='home'>
      <div className='home__top'>
        <div className='home__title'>
          <div className='home__title-text'>Notifications</div>
        </div>
      </div>
      <div className='post'>
        {notifications.length > 0 ? (
          notifications.map((noti: NotificationProps) => (
            <NotificationBox notification={noti} key={noti.id} />
          ))
        ) : (
          <div className='post__no-posts'>
            <div className='post__text'>알림이 없습니다</div>
          </div>
        )}
      </div>
    </div>
  );
}
