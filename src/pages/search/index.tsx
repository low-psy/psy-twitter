import PostBox from 'Components/posts/PostBox';
import AuthContext from 'context/AuthContext';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useContext, useEffect, useState } from 'react';

export default function SearchPage() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [tagQuery, setTagQuery] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setTagQuery(value.trim());
  };

  useEffect(() => {
    if (user && tagQuery) {
      const postsRef = collection(db, 'posts');
      const postsQuery = query(
        postsRef,
        where('hashTags', 'array-contains-any', [tagQuery]),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(postsQuery, (postsSnapShot) => {
        let postsArray = postsSnapShot.docs.map((snapshot) => ({
          ...snapshot.data(),
          id: snapshot.id,
        }));
        setPosts(postsArray as PostProps[]);
      });
      return () => unsubscribe();
    }
  }, [tagQuery, user]);

  return (
    <div className='home'>
      <div className='home__top'>
        <div className='home__title'>
          <div className='home__title-text'>Search</div>
        </div>
        <div className='home__search-div'>
          <input
            className='home__search'
            placeholder='해시태그 검색'
            onChange={handleChange}
          />
        </div>
      </div>
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
    </div>
  );
}
