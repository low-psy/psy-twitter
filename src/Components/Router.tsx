import Homepage from 'pages/home';
import { Navigate, Route, Routes } from 'react-router-dom';

export default function Router() {
  return (
    <Routes>
      <Route path='/' element={<Homepage />} />
      <Route path='/posts' element={<Homepage />} />
      <Route path='/posts:id' element={<Homepage />} />
      <Route path='/posts/new' element={<Homepage />} />
      <Route path='/posts/edit:id' element={<Homepage />} />
      <Route path='/profile' element={<Homepage />} />
      <Route path='/profile/edit' element={<Homepage />} />
      <Route path='/notifications' element={<Homepage />} />
      <Route path='/search' element={<Homepage />} />
      <Route path='/users/login' element={<Homepage />} />
      <Route path='/users/signup' element={<Homepage />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  );
}
