import AuthContext from 'context/AuthContext';
import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { db } from 'firebaseApp';
import { CommentProps, PostProps } from 'pages/home';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import styles from './Comment.module.scss';

interface CommentBoxProps {
  comment: CommentProps;
  post: PostProps;
}

export default function CommentBox({ comment, post }: CommentBoxProps) {
  const { user } = useContext(AuthContext);
  const handleDeleteComment = async () => {
    if (post) {
      try {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, { comments: arrayRemove(comment) });
        toast.error('댓글이 삭제되었습니다');
      } catch (e) {
        toast.error('댓글 삭제에 실패하였습니다');
      }
    }
  };

  return (
    <div key={comment.createdAt} className={styles.comment}>
      <div className={styles.comment__borderBox}>
        <div className={styles.comment__imgBox}>
          <div className={styles.comment__flexBox}>
            <img src={comment.profileUrl || `/logo192.png`} alt='profile' />
            <div className={styles.comment__email}>{comment.email}</div>
            <div className={styles.comment__createdAt}>{comment.createdAt}</div>
          </div>
        </div>
        <div className={styles.comment__content}>{comment.comment}</div>
        <div className={styles.comment__submitDiv}>
          {comment.uid === user?.uid && (
            <button
              type='button'
              className={styles.comment__deleteBtn}
              onClick={handleDeleteComment}
            >
              delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
