import AuthContext from 'context/AuthContext';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

export interface CommentFormProps {
  post: PostProps | null;
}

export default function CommentForm({ post }: CommentFormProps) {
  const [comment, setComment] = useState<string>('');
  const { user } = useContext(AuthContext);

  const truncate = (str: string) => {
    return str.length > 10 ? str.substring(0, 10) + '...' : str;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (post && user) {
      const postRef = doc(db, 'posts', post.id);
      const commentObj = {
        comment: comment,
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toLocaleDateString('ko', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        profileUrl: user.photoURL,
      };
      try {
        await updateDoc(postRef, {
          comments: arrayUnion(commentObj),
        });

        if (user.uid !== post.uid) {
          // 댓글 생성 알림 생성하기
          await addDoc(collection(db, 'notifications'), {
            createdAt: new Date().toLocaleDateString('ko', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            uid: post.uid,
            isRead: false,
            url: `/posts/${post.id}`,
            content: `"${truncate(post.content)}" 글에 댓글이 작성되었습니다`,
          });
        }

        toast.success('댓글이 추가되었습니다');
        setComment('');
      } catch (e) {
        toast.error('댓글 추가에 실패했습니다');
        console.log(e);
      }
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === 'comment') {
      setComment(value);
    }
  };
  return (
    <form className='post-form' onSubmit={handleSubmit}>
      <textarea
        className='post-form__textarea'
        name='comment'
        id='comment'
        required
        placeholder='댓글을 입력해 주세요'
        onChange={handleChange}
        value={comment}
      />
      <div className='post-form__submit-area'>
        <div />
        <input
          type='submit'
          value='Comment'
          className='post-form__submit-btn'
          disabled={!comment}
        />
      </div>
    </form>
  );
}
