import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import api from '../lib/api';

export default function WorkspaceBoards() {
  const { id } = useParams();
  const nav = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // create board modal (pre-select this workspace)
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [wsRes, bRes] = await Promise.all([
          api.get(`/workspaces/${id}`),
          api.get(`/boards?workspaceId=${id}`),
        ]);
        setWorkspace(wsRes.data.workspace);
        setBoards(bRes.data.boards);
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load workspace');
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function createBoard(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true); setErr('');
    try {
      const { data } = await api.post('/boards', { name: name.trim(), workspaceIds: [id] });
      setBoards(prev => [data.board, ...prev]);
      setName(''); setShowCreate(false);
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Failed to create board');
    } finally { setCreating(false); }
  }

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const count = useMemo(() => boards.length, [boards]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!workspace) return <div style={{ padding: 24, color: 'red' }}>{err || 'Workspace not found'}</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav('/boards')}>{'← Back'}</button>
          <h2 style={{ margin: 0 }}>{workspace.name}</h2>
          <span style={{ fontSize: 12, color: '#555' }}>Boards: {count}</span>
        </div>
        <div>
          <span style={{ marginRight: 12 }}>Hi, {user?.name}</span>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowCreate(true)}>+ Create Board in this Workspace</button>
      </div>

      {boards.length === 0 ? (
        <div style={{ color: '#666' }}>No boards yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
          {boards.map(b => (
            <button
              key={b._id}
              onClick={() => nav(`/boards/${b._id}`)}
              style={{ textAlign: 'left', border: '1px solid #ddd', borderRadius: 12, padding: 12, background: '#fff', cursor: 'pointer' }}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => !creating && setShowCreate(false)}>
          <h3 style={{ marginTop: 0 }}>Create Board in “{workspace.name}”</h3>
          {err && <div style={{ color: 'red', marginBottom: 8 }}>{err}</div>}
          <form onSubmit={createBoard} style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Board name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: 8, flex: 1 }}
              autoFocus
            />
            <button type="submit" disabled={creating || !name.trim()}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
const backdropStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { width: 420, background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
