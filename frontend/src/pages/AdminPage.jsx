import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  fetchFeedPosts, createFeedPost, updateFeedPost, deleteFeedPost,
  fetchEducationTips, createEducationTip, updateEducationTip, deleteEducationTip,
  generateDailyFeed, seedContentIfEmpty, fetchGenerationLogs, fetchTopPost, fetchEngagementByType,
} from '../services/contentService';
import './shared-pages.css';

const ADMIN_PASS = 'awesome2026';
const ARTICLES_KEY = 'alu_admin_articles';
const GAMES_KEY = 'alu_admin_games';

const CATEGORIES = ['Mindset', 'Productivity', 'Health', 'Focus', 'Habits', 'Motivation', 'Sleep', 'Nutrition'];
const GAME_TYPES = ['Memory', 'Speed', 'Deep Work', 'Single Task', 'Physical'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const ICONS = ['🎯', '🧠', '⚡', '🔥', '💡', '🎮', '🏆', '⭐', '🌟', '💪'];

const defaultArticle = { title: '', category: 'Mindset', body: '', tags: '', featured: false, status: 'draft' };
const defaultGame = { name: '', type: 'Memory', difficulty: 'Beginner', xp: 50, icon: '🎯', description: '' };

function ArticlesTab() {
  const [articles, setArticles] = useState(() => JSON.parse(localStorage.getItem(ARTICLES_KEY) || '[]'));
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState('');

  const save = (list) => { setArticles(list); localStorage.setItem(ARTICLES_KEY, JSON.stringify(list)); };

  const submit = () => {
    if (!form.title.trim()) return;
    const list = form.id ? articles.map(a => a.id === form.id ? form : a) : [...articles, { ...form, id: Date.now(), createdAt: new Date().toISOString() }];
    save(list);
    setForm(null);
  };

  const del = (id) => save(articles.filter(a => a.id !== id));
  const toggle = (id, field) => save(articles.map(a => a.id === id ? { ...a, [field]: !a[field] } : a));

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

  if (form !== null) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setForm(null)} className="btn-o" style={{ padding: '8px 16px' }}>← Back</button>
        <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? 'Edit Article' : 'New Article'}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>TITLE *</label>
          <input className="fi" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title..." data-testid="article-title-input" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>CATEGORY</label>
            <select className="fi" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>STATUS</label>
            <select className="fi" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>BODY</label>
          <textarea className="fi" rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Article content..." data-testid="article-body-input" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>TAGS (comma separated)</label>
          <input className="fi" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="focus, productivity, mindset..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--border)', background: form.featured ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
            {form.featured && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Featured article</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-p" onClick={submit} data-testid="save-article-btn">{form.id ? 'Save Changes' : 'Create Article'}</button>
          <button className="btn-o" onClick={() => setForm(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>Articles</h3>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 2 }}>{articles.length} article{articles.length !== 1 ? 's' : ''} total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="fi" style={{ width: 200 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
          <button className="btn-p" onClick={() => setForm({ ...defaultArticle })} data-testid="new-article-btn">+ New Article</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-fg)' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>📝</p>
          <p style={{ fontWeight: 600 }}>No articles yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Click "+ New Article" to create your first one</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => (
            <div key={a.id} className="content-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</p>
                  {a.featured && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,213,79,.2)', color: 'var(--accent-fg)', padding: '2px 8px', borderRadius: 20 }}>Featured</span>}
                  <span style={{ fontSize: 10, fontWeight: 700, background: a.status === 'published' ? 'rgba(77,182,172,.12)' : 'var(--muted)', color: a.status === 'published' ? 'var(--primary)' : 'var(--muted-fg)', padding: '2px 8px', borderRadius: 20 }}>{a.status}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 3 }}>{a.category}{a.tags ? ` · ${a.tags}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggle(a.id, 'featured')} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)' }}>★ {a.featured ? 'Unfeature' : 'Feature'}</button>
                <button onClick={() => setForm(a)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--fg)' }} data-testid={`edit-article-${a.id}`}>Edit</button>
                <button onClick={() => del(a.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} data-testid={`delete-article-${a.id}`}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GamesTab() {
  const [games, setGames] = useState(() => JSON.parse(localStorage.getItem(GAMES_KEY) || '[]'));
  const [form, setForm] = useState(null);

  const save = (list) => { setGames(list); localStorage.setItem(GAMES_KEY, JSON.stringify(list)); };
  const submit = () => {
    if (!form.name.trim()) return;
    const list = form.id ? games.map(g => g.id === form.id ? form : g) : [...games, { ...form, id: Date.now() }];
    save(list); setForm(null);
  };
  const del = (id) => save(games.filter(g => g.id !== id));

  if (form !== null) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setForm(null)} className="btn-o" style={{ padding: '8px 16px' }}>← Back</button>
        <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? 'Edit Game' : 'New Game'}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>GAME NAME *</label>
            <input className="fi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Game name..." data-testid="game-name-input" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>ICON</label>
            <select className="fi" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
              {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>TYPE</label>
            <select className="fi" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {GAME_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>DIFFICULTY</label>
            <select className="fi" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>XP</label>
            <input className="fi" type="number" min={10} max={500} value={form.xp} onChange={e => setForm(f => ({ ...f, xp: parseInt(e.target.value) || 50 }))} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
          <textarea className="fi" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this game challenge?" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-p" onClick={submit} data-testid="save-game-btn">{form.id ? 'Save Changes' : 'Create Game'}</button>
          <button className="btn-o" onClick={() => setForm(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>Custom Games</h3>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 2 }}>{games.length} custom game{games.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-p" onClick={() => setForm({ ...defaultGame })} data-testid="new-game-btn">+ New Game</button>
      </div>
      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-fg)' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>🎮</p>
          <p style={{ fontWeight: 600 }}>No custom games yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Create custom challenges for your users</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {games.map(g => (
            <div key={g.id} className="content-item">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{g.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</p>
                    <span className="xp-badge">+{g.xp} XP</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>{g.type} · {g.difficulty}</p>
                  {g.description && <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4, lineHeight: 1.5 }}>{g.description}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button onClick={() => setForm(g)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(g.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedTab() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [topPost, setTopPost] = useState(null);
  const [engagementByType, setEngagementByType] = useState(null);

  const FEED_TYPES = ['conspiracy', 'reframe', 'affirmation', 'quickwin', 'cosmic'];
  const FEED_VISUALS = ['lotus', 'daisy', 'circle', 'stats', 'cosmic'];
  const GRADIENTS = {
    conspiracy: 'from-primary/20 via-transparent to-transparent',
    reframe: 'from-accent/20 via-transparent to-transparent',
    affirmation: 'from-secondary/30 via-transparent to-transparent',
    quickwin: 'from-primary/20 via-transparent to-transparent',
    cosmic: 'from-purple-500/20 via-transparent to-transparent',
  };
  const CATEGORY_LABEL = {
    conspiracy: 'Witty Conspiracy', reframe: 'Awesome Reframe', affirmation: 'Bloom Moment',
    quickwin: 'Quick Win Spotlight', cosmic: 'Cosmic Teaser',
  };
  const defaultPost = { type: 'affirmation', category: CATEGORY_LABEL.affirmation, visual: 'lotus', text: '', subtext: '', active: true };

  const load = async () => {
    setLoading(true);
    await seedContentIfEmpty();
    const [list, logList, top, byType] = await Promise.all([
      fetchFeedPosts({ activeOnly: false }),
      fetchGenerationLogs({ days: 30 }),
      fetchTopPost({ days: 7 }),
      fetchEngagementByType({ days: 7 }),
    ]);
    setPosts(list);
    setLogs(logList);
    setTopPost(top);
    setEngagementByType(byType);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.text.trim()) { toast.error('Text is required'); return; }
    const gradient = GRADIENTS[form.type] || GRADIENTS.affirmation;
    const payload = { ...form, gradient, category: form.category || CATEGORY_LABEL[form.type] };
    try {
      if (form.id) {
        await updateFeedPost(form.id, payload);
        toast.success('Post updated');
      } else {
        await createFeedPost(payload);
        toast.success('Post created');
      }
      setForm(null);
      await load();
    } catch (e) { toast.error('Save failed: ' + e.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await deleteFeedPost(id); toast.success('Deleted'); await load(); }
    catch (e) { toast.error('Delete failed: ' + e.message); }
  };

  const toggleActive = async (p) => {
    try { await updateFeedPost(p.id, { active: !p.active }); await load(); }
    catch (e) { toast.error(e.message); }
  };

  const generate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await generateDailyFeed({ source: 'admin', force: true });
      if (res.skipped) toast.info('Already generated today — forced new batch anyway');
      toast.success(`Generated ${res.count} AI posts ✨`);
      await load();
    } catch (e) { toast.error('AI generation failed: ' + e.message); }
    setGenerating(false);
  };

  if (form !== null) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setForm(null)} className="btn-o" style={{ padding: '8px 16px' }}>← Back</button>
        <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? 'Edit Feed Post' : 'New Feed Post'}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>TYPE</label>
            <select className="fi" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category: CATEGORY_LABEL[e.target.value] }))}>
              {FEED_TYPES.map(t => <option key={t} value={t}>{CATEGORY_LABEL[t]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>VISUAL</label>
            <select className="fi" value={form.visual} onChange={e => setForm(f => ({ ...f, visual: e.target.value }))}>
              {FEED_VISUALS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>MAIN TEXT *</label>
          <textarea className="fi" rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="The main message..." data-testid="feed-text-input" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>SUBTEXT</label>
          <input className="fi" value={form.subtext || ''} onChange={e => setForm(f => ({ ...f, subtext: e.target.value }))} placeholder="Short tag line..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--border)', background: form.active ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.active && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Active (visible in feed)</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-p" onClick={submit} data-testid="save-feed-btn">{form.id ? 'Save Changes' : 'Create Post'}</button>
          <button className="btn-o" onClick={() => setForm(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  const filtered = posts.filter(p => (p.text || '').toLowerCase().includes(search.toLowerCase()) || (p.type || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>Feed Posts</h3>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 2 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} · auto-daily AI generation runs on first user visit
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="fi" style={{ width: 180 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
          <button className="btn-o" onClick={() => setShowHistory(s => !s)} data-testid="toggle-history-btn">
            {showHistory ? 'Hide History' : '📊 History (30d)'}
          </button>
          <button className="btn-o" onClick={generate} disabled={generating} style={{ opacity: generating ? 0.6 : 1 }} data-testid="generate-ai-feed-btn">
            {generating ? 'Generating…' : '✨ Generate 7 AI Posts'}
          </button>
          <button className="btn-p" onClick={() => setForm({ ...defaultPost })} data-testid="new-feed-btn">+ New Post</button>
        </div>
      </div>

      {(topPost || (engagementByType && Object.values(engagementByType).some(v => v.count > 0))) && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16, background: 'linear-gradient(135deg, rgba(77,182,172,.08), rgba(139,92,246,.08))', border: '1px solid rgba(77,182,172,.2)' }} data-testid="engagement-insights-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Engagement Insights (last 7 days)</p>
          </div>
          {topPost ? (
            <div style={{ marginBottom: 14 }} data-testid="top-post-card">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted-fg)', marginBottom: 6 }}>Top Performing Post</p>
              <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 8 }}>"{(topPost.text || '').slice(0, 160)}{(topPost.text || '').length > 160 ? '…' : ''}"</p>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--muted-fg)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'var(--primary-l)', color: 'var(--primary)', textTransform: 'uppercase' }}>{topPost.type}</span>
                <span>♥ {topPost.likes || 0}</span>
                <span>💾 {topPost.saves || 0}</span>
                <span>↗ {topPost.shares || 0}</span>
                <span style={{ fontWeight: 700, color: 'var(--fg)' }}>Score: {topPost.score}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 14, fontStyle: 'italic' }}>
              No engagement signal yet. Users need to heart/save/share posts for insights to appear.
            </p>
          )}
          {engagementByType && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted-fg)', marginBottom: 8 }}>Avg Score by Type (seeds next AI batch)</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} data-testid="engagement-by-type">
                {Object.entries(engagementByType).sort(([, a], [, b]) => b.avg - a.avg).map(([type, data]) => (
                  <div key={type} style={{ padding: '6px 12px', background: 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-fg)' }}>{type}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: data.avg > 0 ? 'var(--primary)' : 'var(--muted-fg)' }}>{data.avg.toFixed(1)}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted-fg)' }}>({data.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20, background: 'var(--muted)' }} data-testid="generation-history-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700 }}>Generation History</p>
              <p style={{ fontSize: 12, color: 'var(--muted-fg)' }}>Last 30 days of auto-gen activity</p>
            </div>
            <button
              className="btn-p"
              onClick={generate}
              disabled={generating}
              style={{ padding: '8px 14px', fontSize: 12, opacity: generating ? 0.6 : 1 }}
              data-testid="regenerate-today-btn"
            >
              {generating ? 'Re-generating…' : '🔄 Re-generate Today'}
            </button>
          </div>
          {logs.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted-fg)', padding: '16px 0', textAlign: 'center' }}>
              No generation logs yet. AI will run automatically when a user visits the Feed tomorrow.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {logs.map(l => {
                const statusColor = l.status === 'done' ? '#10b981' : l.status === 'failed' ? '#ef4444' : '#f59e0b';
                const statusBg = l.status === 'done' ? 'rgba(16,185,129,.12)' : l.status === 'failed' ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)';
                const when = l.generatedAt || l.startedAt;
                const timeStr = when ? new Date(when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 12 }} data-testid={`history-row-${l.id}`}>
                    <span style={{ fontWeight: 700, minWidth: 92, fontFamily: 'monospace' }}>{l.date || l.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: statusBg, color: statusColor, textTransform: 'uppercase', minWidth: 60, textAlign: 'center' }}>{l.status || 'unknown'}</span>
                    <span style={{ color: 'var(--muted-fg)', minWidth: 90 }}>{l.count != null ? `${l.count} posts` : '—'}</span>
                    <span style={{ color: 'var(--muted-fg)', minWidth: 70 }}>{timeStr}</span>
                    <span style={{ color: 'var(--muted-fg)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{l.source || '—'}</span>
                    {l.winningTypes && l.winningTypes.length > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--primary)', fontStyle: 'italic' }} title="AI was biased toward these types based on past engagement">→ {l.winningTypes.join(', ')}</span>
                    )}
                    {l.error && <span style={{ color: '#ef4444', fontSize: 11, flex: 1, textAlign: 'right', fontStyle: 'italic' }} title={l.error}>{l.error.slice(0, 60)}{l.error.length > 60 ? '…' : ''}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {loading ? (
        <p style={{ color: 'var(--muted-fg)', padding: 20 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted-fg)' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>📱</p>
          <p style={{ fontWeight: 600 }}>No feed posts yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(p => (
            <div key={p.id} className="content-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary-l)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{p.type}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, background: p.source === 'ai' || p.source === 'ai-admin' ? 'rgba(139,92,246,0.15)' : p.source === 'evergreen' ? 'rgba(77,182,172,.12)' : 'var(--muted)', color: p.source === 'ai' || p.source === 'ai-admin' ? '#8b5cf6' : p.source === 'evergreen' ? 'var(--primary)' : 'var(--muted-fg)', padding: '2px 8px', borderRadius: 20 }}>{p.source}</span>
                  {!p.active && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 20 }}>inactive</span>}
                  {(p.likes || p.saves || p.shares) ? (
                    <span style={{ fontSize: 10, color: 'var(--muted-fg)', display: 'flex', gap: 8 }} data-testid={`engagement-${p.id}`}>
                      <span>♥ {p.likes || 0}</span>
                      <span>💾 {p.saves || 0}</span>
                      <span>↗ {p.shares || 0}</span>
                    </span>
                  ) : null}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5 }}>{p.text}</p>
                {p.subtext && <p style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>{p.subtext}</p>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleActive(p)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)' }}>{p.active ? 'Hide' : 'Show'}</button>
                <button onClick={() => setForm(p)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--fg)' }} data-testid={`edit-feed-${p.id}`}>Edit</button>
                <button onClick={() => del(p.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} data-testid={`delete-feed-${p.id}`}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationTab() {
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const ICONS_EDU = ['Target', 'Layers', 'Lightbulb', 'Clock', 'Zap', 'BookOpen'];
  const defaultTip = { category: 'habit', title: '', content: '', source: 'Atomic Habits', icon: 'Target', order: 100, active: true };

  const load = async () => {
    setLoading(true);
    await seedContentIfEmpty();
    const [h, f] = await Promise.all([
      fetchEducationTips({ category: 'habit', activeOnly: false }),
      fetchEducationTips({ category: 'focus', activeOnly: false }),
    ]);
    setTips([...h, ...f]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return; }
    try {
      if (form.id) { await updateEducationTip(form.id, form); toast.success('Updated'); }
      else { await createEducationTip(form); toast.success('Created'); }
      setForm(null); await load();
    } catch (e) { toast.error(e.message); }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this tip?')) return;
    try { await deleteEducationTip(id); toast.success('Deleted'); await load(); }
    catch (e) { toast.error(e.message); }
  };
  const toggleActive = async (t) => {
    try { await updateEducationTip(t.id, { active: !t.active }); await load(); }
    catch (e) { toast.error(e.message); }
  };

  if (form !== null) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setForm(null)} className="btn-o" style={{ padding: '8px 16px' }}>← Back</button>
        <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>{form.id ? 'Edit Tip' : 'New Tip'}</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>CATEGORY</label>
            <select className="fi" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="habit">Habit Tip</option>
              <option value="focus">Focus Explanation</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>ICON</label>
            <select className="fi" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
              {ICONS_EDU.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>ORDER</label>
            <input className="fi" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 100 }))} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>TITLE *</label>
          <input className="fi" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} data-testid="edu-title-input" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>CONTENT *</label>
          <textarea className="fi" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} data-testid="edu-content-input" />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)', display: 'block', marginBottom: 6 }}>SOURCE</label>
          <input className="fi" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--border)', background: form.active ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.active && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Active</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-p" onClick={submit} data-testid="save-edu-btn">{form.id ? 'Save' : 'Create'}</button>
          <button className="btn-o" onClick={() => setForm(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="fh" style={{ fontSize: 20, fontWeight: 700 }}>Education Tips</h3>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginTop: 2 }}>{tips.length} tip{tips.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-p" onClick={() => setForm({ ...defaultTip })} data-testid="new-edu-btn">+ New Tip</button>
      </div>
      {loading ? (
        <p style={{ color: 'var(--muted-fg)', padding: 20 }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tips.map(t => (
            <div key={t.id} className="content-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: t.category === 'habit' ? 'rgba(77,182,172,.12)' : 'rgba(139,92,246,.15)', color: t.category === 'habit' ? 'var(--primary)' : '#8b5cf6', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>{t.category}</span>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</p>
                  {!t.active && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,.12)', color: '#ef4444', padding: '2px 8px', borderRadius: 20 }}>inactive</span>}
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 3, lineHeight: 1.5 }}>{t.content.slice(0, 140)}{t.content.length > 140 ? '…' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleActive(t)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)' }}>{t.active ? 'Hide' : 'Show'}</button>
                <button onClick={() => setForm(t)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--fg)' }} data-testid={`edit-edu-${t.id}`}>Edit</button>
                <button onClick={() => del(t.id)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }} data-testid={`delete-edu-${t.id}`}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ onLogout }) {
  const [pass, setPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');

  const changePass = () => {
    if (pass !== ADMIN_PASS) { setMsg('Current password incorrect'); return; }
    if (newPass.length < 6) { setMsg('New password must be at least 6 characters'); return; }
    setMsg('Password change is session-only (not persisted). Use the source to update permanently.');
  };

  const clearAll = (key, label) => {
    if (window.confirm(`Delete all ${label}? This cannot be undone.`)) {
      localStorage.removeItem(key);
      setMsg(`All ${label} deleted.`);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h3 className="fh" style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Settings</h3>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Change Password</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="fi" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Current password" />
          <input className="fi" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" />
          <button className="btn-p" onClick={changePass}>Update Password</button>
          {msg && <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{msg}</p>}
        </div>
      </div>
      <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Danger Zone</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => clearAll(ARTICLES_KEY, 'articles')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 700, fontFamily: 'Manrope,sans-serif', textAlign: 'left' }}>Delete All Articles</button>
          <button onClick={() => clearAll(GAMES_KEY, 'games')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 700, fontFamily: 'Manrope,sans-serif', textAlign: 'left' }}>Delete All Custom Games</button>
        </div>
      </div>
      <button className="btn-o" onClick={onLogout}>Log Out of Admin</button>
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('alu_admin') === '1');
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState('articles');

  const login = () => {
    if (passInput === ADMIN_PASS) { sessionStorage.setItem('alu_admin', '1'); setAuth(true); }
    else { setPassError('Incorrect password'); setPassInput(''); }
  };

  const logout = () => { sessionStorage.removeItem('alu_admin'); setAuth(false); };

  if (!auth) return (
    <div className="alu-s" data-testid="admin-login-page">
      <div className="orb" style={{ left: '50%', top: '20%', width: 400, height: 400, background: 'rgba(77,182,172,0.07)', filter: 'blur(120px)', animationDuration: '13s', transform: 'translateX(-50%)' }} />
      <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
        <div className="card au" style={{ padding: '40px 36px', maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--primary-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 26 }}>🔐</div>
          <h1 className="fh" style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Admin Panel</h1>
          <p style={{ fontSize: 13, color: 'var(--muted-fg)', marginBottom: 24, lineHeight: 1.6 }}>Enter your admin password to continue</p>
          <input
            className="fi" type="password" value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Enter password..."
            style={{ marginBottom: 10 }}
            data-testid="admin-password-input"
            autoFocus
          />
          {passError && <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 10 }}>{passError}</p>}
          <button className="btn-p" style={{ width: '100%' }} onClick={login} data-testid="admin-login-btn">Access Admin</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="alu-s" data-testid="admin-page">
      <div className="orb" style={{ left: '-5%', top: '-5%', width: 350, height: 350, background: 'rgba(77,182,172,0.06)', filter: 'blur(100px)', animationDuration: '15s' }} />
      <div className="grid-dot-bg" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <section style={{ paddingTop: 48, paddingBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 4, color: 'var(--primary)', marginBottom: 6 }}>Admin Panel</p>
            <h1 className="fh" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.05 }}>Content <span className="glow-text">Manager</span></h1>
          </div>
          <button className="btn-o" onClick={logout} style={{ padding: '9px 18px', fontSize: 13 }}>Log Out</button>
        </section>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--muted)', borderRadius: 14, padding: 4, marginBottom: 28, width: 'fit-content' }}>
          {[{ id: 'articles', label: '📝 Articles' }, { id: 'feed', label: '📱 Feed' }, { id: 'education', label: '📚 Education' }, { id: 'games', label: '🎮 Games' }, { id: 'settings', label: '⚙️ Settings' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn${activeTab === t.id ? ' active' : ''}`} data-testid={`admin-tab-${t.id}`}>{t.label}</button>
          ))}
        </div>

        <div className="card" style={{ padding: '24px 28px' }}>
          {activeTab === 'articles' && <ArticlesTab />}
          {activeTab === 'feed' && <FeedTab />}
          {activeTab === 'education' && <EducationTab />}
          {activeTab === 'games' && <GamesTab />}
          {activeTab === 'settings' && <SettingsTab onLogout={logout} />}
        </div>
      </div>
    </div>
  );
}
