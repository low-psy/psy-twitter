import Loader from 'Components/loader/Loader';
import PostBox from 'Components/posts/PostBox';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostNavigation from 'Components/posts/Navigation';
import CommentForm from 'Components/Comments/CommentForm';
import CommentBox from 'Components/Comments/CommentBox';

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<PostProps | null>();
  const getPost = useCallback(async () => {
    if (id) {
      const docRef = doc(db, 'posts', id);
      onSnapshot(docRef, (doc) => {
        setPost({ ...doc.data(), id: doc.id } as PostProps);
      });
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      getPost();
    }
  }, [id, getPost]);
  return (
    <div className='post'>
      <PostNavigation post={post} />
      {post ? (
        <>
          <PostBox post={post} />
          <CommentForm post={post} />
          {post.comments
            ?.slice(0)
            .reverse()
            .map((comment) => {
              return (
                <CommentBox
                  comment={comment}
                  post={post}
                  key={comment.createdAt}
                />
              );
            })}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}
