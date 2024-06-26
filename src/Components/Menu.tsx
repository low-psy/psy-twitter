import AuthContext from 'context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { app } from 'firebaseApp';
import { useContext } from 'react';
import { BiUserCircle } from 'react-icons/bi';
import { BsHouse } from 'react-icons/bs';
import { MdLogout, MdLogin } from 'react-icons/md';
import { AiOutlineSearch } from 'react-icons/ai';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useTranslation from '../hooks/useTranslation';

export default function MenuList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className='footer'>
      <div className='footer__grid'>
        <button type='button' onClick={() => navigate('/')}>
          <BsHouse />
          <span className='footer__grid--text'> {t('MENU_HOME')}</span>
        </button>
        <button type='button' onClick={() => navigate('/profile')}>
          <BiUserCircle />
          <span className='footer__grid--text'> {t('MENU_PROFILE')}</span>
        </button>
        <button type='button' onClick={() => navigate('/search')}>
          <AiOutlineSearch />
          <span className='footer__grid--text'> {t('MENU_SEARCH')}</span>
        </button>
        <button type='button' onClick={() => navigate('/notifications')}>
          <IoIosNotificationsOutline />
          <span className='footer__grid--text'> {t('MENU_NOTI')}</span>
        </button>
        {user === null ? (
          <button type='button' onClick={() => navigate('/')}>
            <MdLogin />
            <span className='footer__grid--text'>({t('MENU_LOGIN')})</span>
          </button>
        ) : (
          <button
            type='button'
            onClick={async () => {
              const auth = getAuth(app);
              try {
                await signOut(auth);
                toast.success('로그아웃 되었습니다');
              } catch (error) {
                toast.error('로그아웃에 실패했습니다!');
              }
            }}
          >
            <MdLogout />
            <span className='footer__grid--text'> {t('MENU_LOGIN')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
