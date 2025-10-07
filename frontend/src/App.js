import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Boards from './pages/Boards';
import ProtectedRoute from './ProtectedRoute';
import WorkspaceBoards from './pages/WorkspaceBoards';
import BoardView from './pages/BoardView';
import Profile from './pages/Profile';



function Home() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div style={{ padding: 20 }}>
      <h2>ManageMe</h2>
      <p>Welcome {user?.name || 'friend'}!</p>
      <button onClick={() => { localStorage.clear(); window.location.href='/login'; }}>Logout</button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/boards" element={<ProtectedRoute><Boards/></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute><WorkspaceBoards/></ProtectedRoute>} />
        <Route path="/boards/:id" element={<ProtectedRoute><BoardView/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path="*" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );
}
