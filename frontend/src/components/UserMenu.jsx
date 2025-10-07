import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)}>
        {user?.name || 'Account'} ▾
      </button>
      {open && (
        <div style={{
          position:'absolute', right:0, top:'100%', background:'#fff', border:'1px solid #ddd',
          borderRadius:8, minWidth:180, padding:8, boxShadow:'0 6px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ padding:'6px 8px', fontSize:12, color:'#555' }}>{user?.email}</div>
          <hr/>
          <button style={{ display:'block', width:'100%', textAlign:'left' }}
                  onClick={() => { setOpen(false); nav('/profile'); }}>
            Profile
          </button>
          <button style={{ display:'block', width:'100%', textAlign:'left', marginTop:6 }}
                  onClick={() => { localStorage.clear(); window.location.href='/login'; }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
