import AuthContext from 'context/AuthContext';
import { addDoc, collection, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import { useContext, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

interface PostFormProps {
  // getPosts: () => Promise<void>;
}

export default function PostForm({}: PostFormProps) {
  const [content, setContent] = useState<string>('');
  const [hashTag, setHashTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const { user } = useContext(AuthContext);

  const handleFileUpload = (e: any) => {
    const {
      target: { files },
    } = e;
    const file = files?.[0];
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = (e: any) => {
        const { result } = e.currentTarget;
        setImageFile(result);
      };
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  const onSubmit = async (e: any) => {
    setIsSubmitting(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);
    e.preventDefault();
    if (content.trim() === '') return toast.error('글을 입력해주세요');
    try {
      // 이미지 먼저 업로드
      let imageUrl = '';
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, 'data_url');
        console.log(data.ref);
        imageUrl = await getDownloadURL(data.ref);
        console.log(imageUrl);
      }
      // 업로드된 이미지의 download url 업데이트
      await addDoc(collection(db, 'posts'), {
        content: content,
        createdAt: new Date().toLocaleDateString('ko', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        uid: user?.uid,
        email: user?.email,
        hashTags: tags,
        imageUrl: imageUrl,
        profileUrl: user?.photoURL,
      });
      setTags([]);
      setHashTag('');
      setContent('');
      toast.success('게시글을 생성했습니다');
      setImageFile(null);
      setIsSubmitting(false);
    } catch (e: any) {
      toast.error('게시글 생성에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === 'content') {
      setContent(value);
    }
  };

  const changeHashTag = (e: any) => {
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

  return (
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
              <img src={imageFile} alt='attachment' width={100} height={100} />
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
        <input type='submit' value='Post' className='post-form__submit-btn' />
      </div>
    </form>
  );
}
