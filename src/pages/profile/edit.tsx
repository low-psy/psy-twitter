import Loader from 'Components/loader/Loader';
import PostNavigation from 'Components/posts/Navigation';
import AuthContext from 'context/AuthContext';
import { updateProfile } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from 'firebase/storage';
import { db, storage } from 'firebaseApp';
import { useContext, useEffect, useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [imageFile, setImageFile] = useState<string | null>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const STORAGE_DOWNLOAD_URL_STR = 'https://firebasestorage.googleapis.com';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === 'displayName') {
      setDisplayName(value);
    }
  };
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
  const handleDeleteImage = () => {
    setImageFile(null);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const storageRef = ref(storage, `${user?.uid}/${uuidv4()}`);
    let imageUrl = '';
    try {
      //기존 스토리지 이미지 삭제
      const photoUrl = user?.photoURL;
      if (photoUrl && photoUrl.includes(STORAGE_DOWNLOAD_URL_STR)) {
        const imageRef = ref(storage, photoUrl);
        if (imageRef) {
          await deleteObject(imageRef).catch((error) => console.log(error));
        }
      }
      //이미지 업로드
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, 'data_url');
        imageUrl = await getDownloadURL(data.ref);
      }
      //updateProfile 호출
      if (user) {
        //profile 변경
        await updateProfile(user, {
          displayName,
          photoURL: imageUrl,
        });

        //post profile 변경

        //post 컬렉션에서 post.uid가 user.uid인 다큐먼트 조회하기
        const q = query(collection(db, 'posts'), where('uid', '==', user.uid));
        const snapshot = await getDocs(q);

        // post 문서의 photoUrl을 변경
        snapshot.docs.map(async (d) => {
          const postId = d.id;
          const postRef = doc(db, 'posts', postId);
          await updateDoc(postRef, { profileUrl: imageUrl });
        });

        toast.success('프로필이 수정되었습니다');
        navigate('/profile');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.log(e);
      toast.error('프로필 수정에 실패하였습니다');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.photoURL) {
      setImageFile(user.photoURL);
    }
    if (user?.displayName) {
      setDisplayName(user?.displayName);
    }
  }, []);

  return (
    <div className='post'>
      {isSubmitting && <Loader />}
      <PostNavigation post={null} />
      <form className='post-form' onSubmit={onSubmit}>
        <div className='post-form__profile'>
          <input
            type='text'
            name='displayName'
            className='post-form__input'
            placeholder='이름'
            onChange={onChange}
            value={displayName}
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
            value='업데이트'
            className='post-form__submit-btn'
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
