import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import UserMenu from '../components/UserMenu';

export default function BoardView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [newList, setNewList] = useState('');
  const [creating, setCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    (async () => {
      try {
        const [bRes, lRes] = await Promise.all([
          api.get(`/boards/${id}`),
          api.get(`/lists?boardId=${id}`),
        ]);
        setBoard(bRes.data.board);
        setLists(lRes.data.lists);
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load board');
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function addList(e) {
    e.preventDefault();
    if (!newList.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/lists', { boardId: id, name: newList.trim() });
      setLists(prev => [...prev, data.list]);
      setNewList('');
    } catch (e2) {
      alert(e2.response?.data?.message || 'Failed to create list');
    } finally { setCreating(false); }
  }

  if (loading) return <div style={{ padding:24 }}>Loading…</div>;
  if (!board) return <div style={{ padding:24, color:'red' }}>{err || 'Board not found'}</div>;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => nav(-1)}>{'← Back'}</button>
          <h2 style={{ margin:0 }}>{board.name}</h2>
        </div>
        <UserMenu user={user} />
      </div>

      {/* Create list */}
      <form onSubmit={addList} style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input
          placeholder="New list name"
          value={newList}
          onChange={e=>setNewList(e.target.value)}
          style={{ padding:8, minWidth:240 }}
        />
        <button type="submit" disabled={creating || !newList.trim()}>
          {creating ? 'Adding…' : 'Add List'}
        </button>
      </form>

      {/* Lists (simple horizontal strip for now) */}
      {lists.length === 0 ? (
        <div style={{ color:'#666' }}>No lists yet.</div>
      ) : (
        <div style={{ display:'flex', gap:12, overflowX:'auto' }}>
          {lists.map(l => (
            <div key={l._id} style={{ minWidth:260, border:'1px solid #ddd', borderRadius:12, padding:12 }}>
              <div style={{ fontWeight:600 }}>{l.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
