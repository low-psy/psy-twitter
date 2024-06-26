import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { app } from 'firebaseApp';
import { BaseSyntheticEvent, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import googleLogo from 'assets/google-logo.webp';

export default function LoginForm() {
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
      toast.success('로그인에 성공했습니다!');
    } catch (error: any) {
      toast.error('로그인에 실패하였습니다!');
    }
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === 'email') {
      setEmail(value);
      const validRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!value?.match(validRegex)) {
        setError('이메일 형식이 올바르지 않습니다');
      } else {
        setError('');
      }
    }
    if (name === 'password') {
      setPassword(value);
      if (value?.length < 8) {
        setError('비밀번호는 8자리 이상 입력해주세요');
      } else {
        setError('');
      }
    }
  };
  const onClickSocialLogin = async (e: BaseSyntheticEvent) => {
    const {
      target: { name },
    } = e;

    let provider;
    const auth = getAuth(app);
    if (name === 'google') {
      provider = new GoogleAuthProvider();
    }
    if (name === 'github') {
      provider = new GithubAuthProvider();
    }
    try {
      if (provider) {
        await signInWithPopup(auth, provider);
        toast.success('로그인 되었습니다!');
      } else {
        toast.error('다시 로그인을 시도해주세요');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  return (
    <form className='form form--lg' onSubmit={onSubmit}>
      <div className='form__title'>로그인</div>
      <div className='form__block'>
        <label htmlFor='email'>이메일</label>
        <input
          type='text'
          name='email'
          id='email'
          value={email}
          required
          onChange={onChange}
        />
      </div>
      <div className='form__block'>
        <label htmlFor='password'>비밀번호</label>
        <input
          type='password'
          name='password'
          id='passowrd'
          required
          value={password}
          onChange={onChange}
        />
      </div>

      {/* 만약 에러가 있는 경우에 */}
      {error && error?.length > 0 && (
        <div className='form__block'>
          <div className='form__error'>{error}</div>
        </div>
      )}
      <div className='form__block'>
        계정이 없으신가요?
        <Link to='/users/signup' className='form__link'>
          회원가입하기
        </Link>
      </div>
      <div className='form__block--lg'>
        <button
          type='submit'
          className='form__btn--submit'
          disabled={error?.length > 0}
        >
          로그인
        </button>
      </div>
      <div className='form__block'>
        <button
          type='button'
          name='google'
          className='form__btn--google'
          onClick={onClickSocialLogin}
        >
          <div className='logo__box'>
            <img src={googleLogo} alt='Google 로고' />
          </div>
          Google로 로그인
        </button>
      </div>
      <div className='form__block'>
        <button
          type='button'
          name='github'
          className='form__btn--github'
          onClick={onClickSocialLogin}
        >
          <FaGithub className='logo__box' />
          Github으로 로그인
        </button>
      </div>
    </form>
  );
}
