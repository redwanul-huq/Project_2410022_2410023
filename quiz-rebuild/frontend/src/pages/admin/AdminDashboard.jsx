import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, courses: 0, quizzes: 0, questions: 0 });
  const [form, setForm] = useState({ username: '', email: '', password: '', is_admin: false });
  const [courseForm, setCourseForm] = useState({ name: '', year: '', semester: '', course_code: '', course_title: '' });
  const [quizForm, setQuizForm] = useState({ title: '', category_id: '', quiz_type: 'Practice Quiz', time_limit_minutes: 5 });
  const [qForm, setQForm] = useState({ course_id: '', quiz_id: '', text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A' });
  const [delForm, setDelForm] = useState({ course_id: '', quiz_id: '', question_id: '' });
  const [delQuestions, setDelQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');

  const refresh = () => {
    api.get('/admin/users').then(r => { setUsers(r.data); setStats(s => ({ ...s, users: r.data.length })); }).catch(() => {});
    api.get('/categories').then(r => {
      const cats = r.data;
      setCourses(cats);
      setStats({ users: users.length, courses: cats.length, quizzes: cats.reduce((s, c) => s + (c.quizzes?.length || 0), 0), questions: 0 });
    });
  };

  const loadDeleteQuestions = () => {
    const qid = delForm.quiz_id;
    if (!qid) { setDelQuestions([]); return; }
    // Fetch questions for this quiz from backend (if endpoint exists) or use local data
    api.get(`/quizzes/${qid}`).then(res => {
      const qs = res.data.questions || [];
      setDelQuestions(qs.map((q, i) => ({ id: q.id || i + 1, text: q.text })));
    }).catch(() => {
      setDelQuestions([]);
    });
  };

  useEffect(() => { refresh(); }, []);

  const addUser = (e) => {
    e.preventDefault();
    api.post('/admin/users', { ...form, is_admin: !!form.is_admin }).then(() => { setMsg('Student added'); setForm({ username: '', email: '', password: '', is_admin: false }); refresh(); }).catch(err => setMsg('Error: ' + (err.response?.data?.detail || err.message)));
  };

  const deleteUser = (id) => {
    if (!confirm('Delete this user?')) return;
    api.delete(`/admin/users/${id}`).then(() => { setMsg('User removed'); refresh(); }).catch(() => setMsg('Delete failed'));
  };

  const addCourse = (e) => {
    e.preventDefault();
    api.post('/admin/courses', courseForm).then(() => { setMsg('Course added'); setCourseForm({ name: '', year: '', semester: '', course_code: '', course_title: '' }); refresh(); }).catch(err => setMsg('Error: ' + (err.response?.data?.detail || err.message)));
  };

  const addQuiz = (e) => {
    e.preventDefault();
    api.post('/admin/quizzes', quizForm).then(() => { setMsg('Quiz created'); setQuizForm({ title: '', category_id: '', quiz_type: 'Practice Quiz', time_limit_minutes: 5 }); refresh(); }).catch(err => setMsg('Error: ' + (err.response?.data?.detail || err.message)));
  };

  const deleteQuestion = (id) => {
    if (!confirm('Delete this question?')) return;
    api.delete(`/admin/questions/${id}`).then(() => {
      setMsg('Question removed');
      // Clear deleted question from selection dropdown immediately
      setDelQuestions(prev => prev.filter(q => q.id !== id));
      setDelForm({ ...delForm, question_id: '' });
      refresh();
    }).catch(() => setMsg('Delete failed'));
  };

  const addQuestion = (e) => {
    e.preventDefault();
    const correctIdx = ['A', 'B', 'C', 'D'].indexOf(qForm.correct);
    const options = [
      { text: qForm.optA, is_correct: correctIdx === 0 },
      { text: qForm.optB, is_correct: correctIdx === 1 },
      { text: qForm.optC, is_correct: correctIdx === 2 },
      { text: qForm.optD, is_correct: correctIdx === 3 },
    ];
    api.post('/admin/questions', { quiz_id: Number(qForm.quiz_id), text: qForm.text, options }).then(() => { setMsg('Question added'); setQForm({ course_id: '', quiz_id: '', text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A' }); if (delForm.quiz_id) loadDeleteQuestions(); }).catch(err => {
      const d = err.response?.data;
      const msg = d?.detail || (typeof d === 'string' ? d : JSON.stringify(d)) || err.message;
      setMsg('Error: ' + msg);
    });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '8px', fontWeight: 700, color: 'var(--text-main)' }}>Admin Dashboard — QuizPulse</h1>
      {msg && <div style={{ padding: '10px 14px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '14px' }}>{msg}</div>}

      <div className="grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: stats.users || '—' },
          { label: 'Courses', value: stats.courses || '—' },
          { label: 'Quizzes', value: stats.quizzes || '—' },
          { label: 'Questions', value: stats.questions || '—' },
        ].map(s => (
          <div className="card" key={s.label} style={{ padding: '20px', textAlign: 'center' }}>
            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#e94560', lineHeight: 1.2, marginBottom: '6px' }}>{s.value}</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Add Student */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Add Student / User</h2>
          <form onSubmit={addUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Username" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.is_admin} onChange={e => setForm({ ...form, is_admin: e.target.checked })} /> Admin
            </label>
            <button className="btn" type="submit">Add User</button>
          </form>
        </div>

        {/* Add Course */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Add Course (Category)</h2>
          <form onSubmit={addCourse} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Name (e.g. ECE 2104 - DSA Sessional)" required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Year" value={courseForm.year} onChange={e => setCourseForm({ ...courseForm, year: e.target.value })} />
              <input placeholder="Semester" value={courseForm.semester} onChange={e => setCourseForm({ ...courseForm, semester: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Course Code" value={courseForm.course_code} onChange={e => setCourseForm({ ...courseForm, course_code: e.target.value })} />
              <input placeholder="Course Title" value={courseForm.course_title} onChange={e => setCourseForm({ ...courseForm, course_title: e.target.value })} />
            </div>
            <button className="btn" type="submit">Add Course</button>
          </form>
        </div>

        {/* Add Quiz */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Add Quiz</h2>
          <form onSubmit={addQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <select value={quizForm.category_id} onChange={e => setQuizForm({ ...quizForm, category_id: e.target.value })} required>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Quiz title" required value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} />
            <select value={quizForm.quiz_type} onChange={e => setQuizForm({ ...quizForm, quiz_type: e.target.value })}>
              <option>CT Quiz</option><option>Semester Quiz</option><option>Lab & Sessional Quiz</option><option>Practice Quiz</option>
            </select>
            <input type="number" placeholder="Time limit (min)" value={quizForm.time_limit_minutes} onChange={e => setQuizForm({ ...quizForm, time_limit_minutes: Number(e.target.value) })} />
            <button className="btn" type="submit">Create Quiz</button>
          </form>
        </div>

        {/* Add Question — select course, then quiz */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Add Question</h2>
          <form onSubmit={addQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select required value={qForm.course_id || ''} onChange={e => {
              const cid = e.target.value;
              setQForm({ ...qForm, course_id: cid, quiz_id: '', text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A' });
            }}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.course_code || c.name}</option>)}
            </select>
            <select required value={qForm.quiz_id} onChange={e => setQForm({ ...qForm, quiz_id: e.target.value })}>
              <option value="">Select quiz...</option>
              {(courses.find(c => String(c.id) === String(qForm.course_id))?.quizzes || []).map(q => <option key={q.id} value={q.id}>{q.title} ({q.quiz_type})</option>)}
            </select>
            <input placeholder="Question text" required value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input placeholder="Option A" value={qForm.optA} onChange={e => setQForm({ ...qForm, optA: e.target.value })} />
              <input placeholder="Option B" value={qForm.optB} onChange={e => setQForm({ ...qForm, optB: e.target.value })} />
              <input placeholder="Option C" value={qForm.optC} onChange={e => setQForm({ ...qForm, optC: e.target.value })} />
              <input placeholder="Option D" value={qForm.optD} onChange={e => setQForm({ ...qForm, optD: e.target.value })} />
            </div>
            <select value={qForm.correct} onChange={e => setQForm({ ...qForm, correct: e.target.value })}>
              <option value="A">Correct: A</option><option value="B">Correct: B</option><option value="C">Correct: C</option><option value="D">Correct: D</option>
            </select>
            <button className="btn" type="submit">Add Question</button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Remove Questions</h2>
        <p style={{ fontSize: '0.9rem', color: '#777', marginBottom: '10px' }}>Select course → select quiz → pick question from list → click Remove.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
          <select value={delForm.course_id || ''} onChange={e => { const c = e.target.value; setDelForm({ ...delForm, course_id: c, quiz_id: '', question_id: '' }); setDelQuestions([]); }}>
            <option value="">Select course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.course_code || c.name}</option>)}
          </select>
          <select value={delForm.quiz_id || ''} onChange={e => { const q = e.target.value; setDelForm({ ...delForm, quiz_id: q, question_id: '' }); if (q) loadDeleteQuestions(); }}>
            <option value="">Select quiz...</option>
            {(courses.find(c => String(c.id) === String(delForm.course_id))?.quizzes || []).map(q => <option key={q.id} value={q.id}>{q.title} ({q.quiz_type})</option>)}
          </select>
        </div>
        {delForm.quiz_id && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
            <select value={delForm.question_id || ''} onChange={e => setDelForm({ ...delForm, question_id: e.target.value })}>
              <option value="">Select question...</option>
              {delQuestions.map(q => <option key={q.id} value={q.id}>{q.id}: {q.text?.substring(0, 40)}...</option>)}
            </select>
            <button className="btn btn-secondary" onClick={() => { if (delForm.question_id) deleteQuestion(Number(delForm.question_id)); else setMsg('Select a question'); }}>Remove Selected</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Registered Users (click ❌ to remove)</h2>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Admin</th>
                <th style={{ padding: '8px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u.email} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-main)' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge" style={u.is_admin ? { backgroundColor: '#e8f5e9', color: '#2e7d32' } : { backgroundColor: '#e2e8f0', color: '#475569' }}>{u.is_admin ? 'Yes' : 'No'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.85rem' }} onClick={() => deleteUser(u.id)} title="Remove">❌</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={3} style={{ padding: '12px', color: '#777' }}>No users loaded. Ensure backend is running.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/quiz-dashboard" className="btn btn-secondary">Browse Quizzes</Link>
          <Link to="/" className="btn">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
