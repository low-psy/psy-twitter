import Homepage from 'pages/home';
import NotificationsPage from 'pages/notifications';
import PostListPage from 'pages/posts';
import PostDetailPage from 'pages/posts/detail';
import PostEditPage from 'pages/posts/edit';
import PostNewPage from 'pages/posts/new';
import ProfilePage from 'pages/profile';
import ProfileEditPage from 'pages/profile/edit';
import SearchPage from 'pages/search';
import { Navigate, Route, Routes } from 'react-router-dom';

export default function Router() {
  return (
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/posts' element={<PostListPage />} />
      <Route path='/posts:id' element={<PostDetailPage />} />
      <Route path='/posts/new' element={<PostNewPage />} />
      <Route path='/posts/edit:id' element={<PostEditPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/profile/edit' element={<ProfileEditPage />} />
      <Route path='/notifications' element={<NotificationsPage />} />
      <Route path='/search' element={<SearchPage />} />
      <Route path='/users/login' element={<Homepage />} />
      <Route path='/users/signup' element={<Homepage />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  );
}
