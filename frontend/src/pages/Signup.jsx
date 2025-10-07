import { useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Add a CSS file for consistent styling

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/boards');
    } catch (e) {
      setErr(e.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={onSubmit} className="auth-form">
        <h2>Sign up</h2>
        {err && <p className="error-message">{err}</p>}
        <input
          className="auth-input"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Create account'}
        </button>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
