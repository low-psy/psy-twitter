import AuthContext from 'context/AuthContext';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useCallback, useContext, useEffect, useState } from 'react';

export interface UserProps {
  id: string;
}

interface FollowingProps {
  post: PostProps;
}

export default function FollowingBox({ post }: FollowingProps) {
  const { user } = useContext(AuthContext);
  const [postFollowers, setPostFollowers] = useState<string[]>([]);

  const onClickFollow = async (e: any) => {
    e.preventDefault();
    try {
      if (user?.uid) {
        //내가 주체가 되어 '팔로잉' 컬렉션 생성 or 업데이트
        const followingRef = doc(db, 'following', user.uid);
        await setDoc(
          followingRef,
          {
            users: arrayUnion({ id: post.uid }),
          },
          { merge: true }
        );

        // 팔로우 당하는 사람이 주체가 되어 '팔로우' 컬렉션 생성 or 업데이트
        const followerRef = doc(db, 'followers', post.uid);
        await setDoc(
          followerRef,
          { users: arrayUnion({ id: user.uid }) },
          { merge: true }
        );

        // 팔로잉뒤 알림 설정
        await addDoc(collection(db, 'notifications'), {
          createdAt: new Date().toLocaleDateString('ko', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          uid: post.uid,
          isRead: false,
          url: `#`,
          content: `"${
            user.email || user.displayName
          }"님이 팔로우를 하셨습니다`,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onClickDeleteFollow = async (e: any) => {
    e.preventDefault();
    try {
      if (user?.uid) {
        // 로그인한 주체의 'Following' 컬렉션에서 post.uid 삭제
        const followingRef = doc(db, 'following', user?.uid);
        await updateDoc(followingRef, {
          users: arrayRemove({ id: post.uid }),
        });

        // 팔로워의 'Follower' 컬렉션에서 user.uid 삭제
        const followersRef = doc(db, 'followers', post.uid);
        await updateDoc(followersRef, {
          users: arrayRemove({ id: user.uid }),
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getFollowers = useCallback(async () => {
    if (post.uid) {
      const ref = doc(db, 'followers', post.uid);
      onSnapshot(ref, (doc) => {
        setPostFollowers([]);
        doc.data()?.users.map((user: UserProps) => {
          setPostFollowers((prev: string[]) => {
            return prev ? [...prev, user?.id] : [];
          });
        });
      });
    }
  }, [post.uid]);

  useEffect(() => {
    if (post.uid) getFollowers();
  }, [getFollowers, post.uid]);

  return (
    <>
      {user?.uid &&
        user.uid !== post.uid &&
        (postFollowers.includes(user.uid) ? (
          <button
            type='button'
            className='post__following-btn'
            onClick={onClickDeleteFollow}
          >
            Following
          </button>
        ) : (
          <button className='post__follow-btn' onClick={onClickFollow}>
            Follow
          </button>
        ))}
    </>
  );
}
