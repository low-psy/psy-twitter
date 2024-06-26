import { UserProps } from 'Components/Following/FollowingBox';
import PostBox from 'Components/posts/PostBox';
import PostForm from 'Components/posts/PostForm';
import AuthContext from 'context/AuthContext';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { useCallback, useContext, useEffect, useState } from 'react';

type tabType = 'all' | 'followingIds';

export interface CommentProps {
  comment: string;
  uid: string;
  email: string;
  createdAt: string;
  profileUrl: string;
}

export interface PostProps {
  id: string;
  email: string;
  content: string;
  createdAt: string;
  uid: string;
  profileUrl?: string;
  likes?: string[];
  likeCount?: number;
  comments?: CommentProps[];
  hashTags?: string[];
  imageUrl?: string;
}

export default function Homepage() {
  const [followingIds, setFollowingIds] = useState<string[]>(['']);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [followingIdsPosts, setFollowingIdsPosts] = useState<PostProps[]>([]);
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<tabType>('all');

  const getFollowingIds = useCallback(async () => {
    if (user?.uid) {
      try {
        const ref = doc(db, 'following', user.uid);
        onSnapshot(ref, (doc) => {
          setFollowingIds(['']);
          doc
            .data()
            ?.users.map((user: UserProps) =>
              setFollowingIds((prev) => [...prev, user.id])
            );
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      getFollowingIds();
    }
  }, [user?.uid, getFollowingIds]);

  useEffect(() => {
    if (user) {
      const postsRef = collection(db, 'posts');
      // 팔로잉 데이터에 대한 쿼리
      const followingIdsPostsQuery = query(
        postsRef,
        where('uid', 'in', followingIds),
        orderBy('createdAt', 'desc')
      );
      onSnapshot(followingIdsPostsQuery, (snapShot) => {
        const dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setFollowingIdsPosts(dataObj as PostProps[]);
      });
      // 전체 데이터에 대한 쿼리
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'));
      onSnapshot(postsQuery, (snapShot) => {
        const dataObj = snapShot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPosts(dataObj as PostProps[]);
      });
    }
  }, [user, followingIds]);

  return (
    <div className='home'>
      <div className='home__top'>
        <div className='home__title'>PSY Twitter</div>
        <div className='home__tabs'>
          <div
            className={`home__tab ${
              activeTab === 'all' && 'home__tab--active'
            }`}
            onClick={() => setActiveTab('all')}
          >
            For you
          </div>
          <div
            className={`home__tab ${
              activeTab === 'followingIds' && 'home__tab--active'
            }`}
            onClick={() => setActiveTab('followingIds')}
          >
            Following
          </div>
        </div>
      </div>
      {/* Post Form */}
      <PostForm />
      {/*  Tweet Posts */}
      {activeTab === 'all' && (
        <div className='post'>
          {posts.length > 0 ? (
            posts?.map((post) => {
              return <PostBox post={post} key={post.id} />;
            })
          ) : (
            <div className='post__no-posts'>
              <div className='post__text'>게시글이 없습니다</div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'followingIds' && (
        <div className='post'>
          {followingIdsPosts.length > 0 ? (
            followingIdsPosts?.map((post) => {
              return <PostBox post={post} key={post.id} />;
            })
          ) : (
            <div className='post__no-posts'>
              <div className='post__text'>게시글이 없습니다</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
