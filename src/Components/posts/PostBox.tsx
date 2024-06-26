import FollowingBox from 'Components/Following/FollowingBox';
import AuthContext from 'context/AuthContext';
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useContext } from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { FaRegComment, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface PostBoxProps {
  post: PostProps;
}

export default function PostBox({ post }: PostBoxProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageRef = ref(storage, post.imageUrl);

  const handleDelete = async () => {
    const confirm = window.confirm('해당 게시글을 삭제하시겠습니까?');
    if (!confirm) return;
    // 이미지가 있는 경우에는 게시글을 삭제하기 전에 이미지부터 삭제하기
    if (post.imageUrl) {
      deleteObject(imageRef).catch((error) => {
        toast.error(error);
      });
    }
    // 게시글 삭제
    try {
      const postRef = doc(db, 'posts', post.id);
      await deleteDoc(postRef);
      toast.success('게시글이 삭제되었습니다');
      navigate('/');
    } catch (e) {
      toast.error('게시글 삭제에 실패했습니다. 다시 시도해 주세요');
    }
  };

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (user?.uid && post.likes?.includes(user.uid)) {
      //사용자가 좋아요를 미리 한 경우 -> 좋아요를 취소한다.
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
        likeCount: post.likeCount
          ? post.likeCount > 0
            ? post.likeCount - 1
            : 0
          : 0,
      });
    } else {
      //사용자가 좋아요를 미리 하지 않은 경우 -> 좋아요를 추가한다.
      await updateDoc(postRef, {
        likes: arrayUnion(user?.uid),
        likeCount: post.likeCount ? post.likeCount + 1 : 1,
      });
    }
  };

  return (
    <div className='post__box' key={post.id}>
      <div className='post__profile'>
        <div className='post__flex'>
          {post.profileUrl ? (
            <img
              src={post.profileUrl}
              alt='profile'
              className='post__profile-img'
            />
          ) : (
            <FaUser className='post__profile-icon' />
          )}
          <div className='post__flex--between'>
            <div className='post__flex'>
              <div className='post__email'>{post?.email}</div>
              <div className='post__createdAt'>{post?.createdAt}</div>
            </div>
            <FollowingBox post={post} />
          </div>
        </div>
        <Link to={`/posts/${post?.id}`}>
          <div className='post__content'>{post?.content}</div>
          {post?.imageUrl && (
            <div className='post__image-div'>
              <img
                src={post.imageUrl}
                alt='post img'
                className='post__image'
                width={100}
                height={100}
              />
            </div>
          )}
          <div className='hashtag__box'>
            {post?.hashTags?.map((tag, index) => {
              return (
                <span className='hashtag__content' key={`${tag}_${index}`}>
                  #{tag}
                </span>
              );
            })}
          </div>
        </Link>
      </div>
      <div className='post__footer'>
        {user?.uid === post.uid && (
          <>
            <button
              type='button'
              className='post__delete'
              onClick={handleDelete}
            >
              Delete
            </button>
            <button type='button' className='post__edit'>
              <Link to={`/posts/edit/${post.id}`}>Edit</Link>
            </button>
          </>
        )}

        <button type='button' className='post__likes' onClick={toggleLike}>
          {user && post.likes?.includes(user?.uid) ? (
            <AiFillHeart />
          ) : (
            <AiOutlineHeart />
          )}
          {post?.likeCount || 0}
        </button>
        <button
          type='button'
          className='post__comments'
          onClick={() => navigate(`/posts/${post?.id}`)}
        >
          <FaRegComment />
          {post?.comments?.length || 0}
        </button>
      </div>
    </div>
  );
}
