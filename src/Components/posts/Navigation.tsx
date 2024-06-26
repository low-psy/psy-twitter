import { PostProps } from 'pages/home';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

interface PostNavigationProps {
  post: PostProps | null | undefined;
}

export default function PostNavigation({ post }: PostNavigationProps) {
  const navigate = useNavigate();
  return (
    <div className='post__header'>
      <div className='post__flex'>
        <button type='button' onClick={() => navigate(-1)}>
          <IoArrowBack className='post__header-btn' />
        </button>
        {post && <div>{post.email}</div>}
      </div>
    </div>
  );
}
