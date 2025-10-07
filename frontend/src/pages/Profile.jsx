import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState('');
  const [err, setErr] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me');
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {}
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setStatus(''); setErr('');
    try {
      const { data } = await api.patch('/users/me', { name, email });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatus('Profile updated');
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Failed to update profile');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwdMsg(''); setPwdErr('');
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      setPwdMsg('Password updated');
      setCurrentPassword(''); setNewPassword('');
    } catch (e2) {
      setPwdErr(e2.response?.data?.message || 'Failed to update password');
    }
  }

  return (
    <div style={{ padding:24, maxWidth:560, margin:'0 auto' }}>
      <h2>Profile</h2>
      <form onSubmit={saveProfile} style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
        {status && <div style={{ color:'green' }}>{status}</div>}
        {err && <div style={{ color:'red' }}>{err}</div>}
        <label>Name
          <input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:8 }}/>
        </label>
        <label>Email
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%', padding:8 }}/>
        </label>
        <div style={{ display:'flex', gap:8 }}>
          <button type="submit">Save</button>
          <a href="/boards" style={{ alignSelf:'center' }}>Back to My Workspaces</a>
        </div>
      </form>

      <h3>Change Password</h3>
      <form onSubmit={changePassword} style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {pwdMsg && <div style={{ color:'green' }}>{pwdMsg}</div>}
        {pwdErr && <div style={{ color:'red' }}>{pwdErr}</div>}
        <label>Current password
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} style={{ width:'100%', padding:8 }}/>
        </label>
        <label>New password (min 6)
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{ width:'100%', padding:8 }}/>
        </label>
        <button type="submit" disabled={!currentPassword || !newPassword}>Update Password</button>
      </form>
    </div>
  );
}
