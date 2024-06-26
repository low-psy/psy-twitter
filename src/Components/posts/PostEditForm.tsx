import AuthContext from 'context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import { PostProps } from 'pages/home';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import PostNavigation from './Navigation';

export default function PostEditForm({}) {
  const { id } = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [hashTag, setHashTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileUpload = (e: any) => {
    const {
      target: { files },
    } = e;
    const file = files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = (e: any) => {
        const { result } = e.currentTarget;
        setImageFile(result);
      };
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);
    try {
      if (post) {
        // 기존 사진 삭제
        if (post.imageUrl) {
          const imageRef = ref(storage, post.imageUrl);
          await deleteObject(imageRef).catch((error) => console.log(error));
        }
        // 새로 업로드한 이미지를 Storage에 저장 및 url 다운로드
        let imageUrl = '';
        if (imageFile) {
          const data = await uploadString(storageRef, imageFile, 'data_url');
          imageUrl = await getDownloadURL(data.ref);
        }
        // 새로 업로드한 이미지 url을 포함한 게시물 다큐먼트 업데이트
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, {
          content: content,
          hashTags: tags,
          updatedAt: new Date().toLocaleDateString('ko', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          imageUrl: imageUrl,
        });
        navigate(`/posts/${post.id}`);
        toast.success('게시글을 수정했습니다');
        setIsSubmitting(false);
        setImageFile(null);
      }
    } catch (e: any) {}
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === 'content') {
      setContent(value);
    }
  };

  const getPost = useCallback(async () => {
    if (id) {
      const postRef = doc(db, 'posts', id);
      const docSnapshot = await getDoc(postRef);
      const post = docSnapshot.data() as PostProps;
      setPost({ ...post, id: docSnapshot.id } as PostProps);
      setTags(post.hashTags || []);
      setContent(post.content);
      setImageFile(post.imageUrl as string);
    }
  }, [id]);

  const changeHashTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setHashTag(value.trim());
  };

  const handleKeyup = (e: any) => {
    if (e.keyCode === 32 && hashTag !== '') {
      // 태그 생성
      // 만약에 같은 태그가 있다면 에러 띄우기
      if (tags.includes(hashTag)) {
        toast.error('태그가 중복됩니다');
      } else {
        setTags((tags) => [...tags, hashTag]);
        setHashTag('');
      }
    }
  };

  const removeTag = (tag: string) => {
    setTags((tags) => tags.filter((prevTag) => prevTag !== tag));
  };

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  useEffect(() => {
    if (id) {
      getPost();
    }
  }, [id, getPost]);

  return (
    <div className='post'>
      <PostNavigation post={post} />
      <form className='post-form' onSubmit={onSubmit}>
        <textarea
          className='post-form__textarea'
          required
          name='content'
          id='content'
          placeholder='무슨 글을 작성하고 싶으신가요?'
          onChange={onChange}
          value={content}
        />
        <div className='post-form__hashtags'>
          <div className='post-form__hashtags-outputs'>
            {tags.map((tag, index) => {
              return (
                <span
                  className='post-form__hashtags-tag'
                  key={`${tag}_${index}`}
                  onClick={() => removeTag(tag)}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
          <input
            className='post-form__input'
            name='hashtag'
            id='hashtag'
            placeholder='해시태그 + 스페이스바 입력'
            onChange={changeHashTag}
            onKeyUp={handleKeyup}
            value={hashTag}
          />
        </div>
        <div className='post-form__submit-area'>
          <div className='post-form__image-area'>
            <label htmlFor='file-input' className='post-form__file'>
              <FiImage className='post-form__file-icon' />
            </label>
            <input
              id='file-input'
              type='file'
              name='file-input'
              accept='image/*'
              onChange={handleFileUpload}
              className='hidden'
            />
            {imageFile && (
              <div className='post-form__attachment'>
                <img
                  src={imageFile}
                  alt='attachment'
                  width={100}
                  height={100}
                />
                <button
                  type='button'
                  className='post-form__clear-btn'
                  onClick={handleDeleteImage}
                  disabled={isSubmitting}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            type='submit'
            value='Update'
            className='post-form__submit-btn'
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
