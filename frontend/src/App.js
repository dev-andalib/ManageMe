import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './ProtectedRoute';

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
        <Route path="/app" element={<ProtectedRoute><Home/></ProtectedRoute>} />
        <Route path="*" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );
}
