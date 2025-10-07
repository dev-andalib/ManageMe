import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import api from '../lib/api';

export default function Boards() {
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]); // used only to compute counts
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // Create Board modal
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boardErr, setBoardErr] = useState('');

  // Inline create workspace (inside board modal)
  const [inlineWsName, setInlineWsName] = useState('');
  const [creatingInlineWs, setCreatingInlineWs] = useState(false);
  const [inlineWsErr, setInlineWsErr] = useState('');

  // Separate Create Workspace modal
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);
  const [wsErr, setWsErr] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  async function load() {
    setLoading(true);
    const [wsRes, bRes] = await Promise.all([
      api.get('/workspaces'),
      api.get('/boards'),
    ]);
    setWorkspaces(wsRes.data.workspaces);
    setBoards(bRes.data.boards);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // Count boards per workspace (boards can belong to multiple workspaces)
  const boardCountByWs = useMemo(() => {
    const counts = {};
    for (const ws of workspaces) counts[ws._id] = 0;
    for (const b of boards) {
      const arr = Array.isArray(b.workspaces) ? b.workspaces : [];
      for (const wsId of arr) if (counts[wsId] != null) counts[wsId]++;
    }
    return counts;
  }, [workspaces, boards]);

  function toggleWs(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function createBoard(e) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreatingBoard(true); setBoardErr('');
    try {
      const workspaceIds = Array.from(selectedIds); // if empty => backend defaults to "My World"
      const { data } = await api.post('/boards', { name: newBoardName.trim(), workspaceIds });
      setBoards(prev => [data.board, ...prev]); // this updates counts
      setNewBoardName(''); setSelectedIds(new Set()); setShowCreateBoard(false);
    } catch (e2) {
      setBoardErr(e2.response?.data?.message || 'Failed to create board');
    } finally { setCreatingBoard(false); }
  }

  async function createWorkspaceInline() {
    if (!inlineWsName.trim()) return;
    setCreatingInlineWs(true); setInlineWsErr('');
    try {
      const { data } = await api.post('/workspaces', { name: inlineWsName.trim() });
      setWorkspaces(prev => [...prev, data.workspace]);
      setSelectedIds(prev => new Set(prev).add(data.workspace._id)); // auto-select
      setInlineWsName('');
    } catch (e) {
      const msg = e.response?.status === 409 ? 'Workspace name already exists'
        : (e.response?.data?.message || 'Failed to create workspace');
      setInlineWsErr(msg);
    } finally { setCreatingInlineWs(false); }
  }

  async function createWorkspaceStandalone(e) {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreatingWs(true); setWsErr('');
    try {
      const { data } = await api.post('/workspaces', { name: newWsName.trim() });
      setWorkspaces(prev => [...prev, data.workspace]);
      setNewWsName(''); setShowCreateWs(false);
    } catch (e2) {
      const msg = e2.response?.status === 409 ? 'Workspace name already exists'
        : (e2.response?.data?.message || 'Failed to create workspace');
      setWsErr(msg);
    } finally { setCreatingWs(false); }
  }

  function logout() { localStorage.clear(); window.location.href = '/login'; }

  if (loading) return <div style={{ padding:24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <h2>Your Workspaces</h2>
        {/* <div>
          <span style={{ marginRight: 12 }}>Hi, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div> */}
        <UserMenu user={user} />
      </div>

      <div style={{ display:'flex', gap:8, marginBottom: 16 }}>
        <button onClick={() => setShowCreateBoard(true)}>+ Create Board</button>
        <button onClick={() => setShowCreateWs(true)}>+ Create Workspace</button>
      </div>

      {/* Workspace clusters (cards) */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:12 }}>
        {workspaces.map(ws => (
          <button
            key={ws._id}
            onClick={() => nav(`/workspaces/${ws._id}`)}
            style={{
              textAlign:'left', border:'1px solid #ddd', borderRadius:12, padding:12,
              background:'#fff', cursor:'pointer'
            }}
          >
            <div style={{ fontWeight:600, marginBottom:6 }}>{ws.name}</div>
            <div style={{ fontSize:12, color:'#555' }}>
              Boards: {boardCountByWs[ws._id] || 0}
            </div>
          </button>
        ))}
      </div>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <Modal onClose={() => !creatingBoard && setShowCreateBoard(false)}>
          <h3 style={{ marginTop: 0 }}>Create Board</h3>
          {boardErr && <div style={{ color:'red', marginBottom:8 }}>{boardErr}</div>}
          <form onSubmit={createBoard} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              placeholder="Board name"
              value={newBoardName}
              onChange={e=>setNewBoardName(e.target.value)}
              style={{ padding:8 }}
              autoFocus
            />
            <div>
              <div style={{ fontWeight:600, marginBottom:6 }}>Add to Workspaces (optional)</div>
              <div style={{ maxHeight:160, overflow:'auto', border:'1px solid #eee', borderRadius:8, padding:8 }}>
                {workspaces.length === 0 && <div style={{ color:'#666' }}>No workspaces found.</div>}
                {workspaces.map(ws => (
                  <label key={ws._id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ws._id)}
                      onChange={() => toggleWs(ws._id)}
                    />
                    {ws.name}
                  </label>
                ))}
              </div>
              <div style={{ fontSize:12, color:'#666', marginTop:6 }}>
                If none selected, it will be added to <b>My World</b>.
              </div>
            </div>

            {/* Inline create workspace */}
            <div style={{ borderTop:'1px solid #eee', paddingTop:10 }}>
              <div style={{ fontWeight:600, marginBottom:6 }}>Create new workspace (inline)</div>
              {inlineWsErr && <div style={{ color:'red', marginBottom:6 }}>{inlineWsErr}</div>}
              <div style={{ display:'flex', gap:8 }}>
                <input
                  placeholder="Workspace name"
                  value={inlineWsName}
                  onChange={e=>setInlineWsName(e.target.value)}
                  style={{ padding:8, flex:1 }}
                />
                <button type="button" onClick={createWorkspaceInline} disabled={creatingInlineWs || !inlineWsName.trim()}>
                  {creatingInlineWs ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:8 }}>
              <button type="button" onClick={() => setShowCreateBoard(false)} disabled={creatingBoard}>Cancel</button>
              <button type="submit" disabled={creatingBoard || !newBoardName.trim()}>
                {creatingBoard ? 'Creating…' : 'Create Board'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Separate Create Workspace Modal */}
      {showCreateWs && (
        <Modal onClose={() => !creatingWs && setShowCreateWs(false)}>
          <h3 style={{ marginTop: 0 }}>Create Workspace</h3>
          {wsErr && <div style={{ color:'red', marginBottom:8 }}>{wsErr}</div>}
          <form onSubmit={createWorkspaceStandalone} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <input
              placeholder="Workspace name"
              value={newWsName}
              onChange={e=>setNewWsName(e.target.value)}
              style={{ padding:8 }}
              autoFocus
            />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setShowCreateWs(false)} disabled={creatingWs}>Cancel</button>
              <button type="submit" disabled={creatingWs || !newWsName.trim()}>
                {creatingWs ? 'Creating…' : 'Create Workspace'}
              </button>
            </div>
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
const backdropStyle = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modalStyle = { width: 480, background:'#fff', borderRadius:12, padding:16, boxShadow:'0 10px 30px rgba(0,0,0,0.2)' };
