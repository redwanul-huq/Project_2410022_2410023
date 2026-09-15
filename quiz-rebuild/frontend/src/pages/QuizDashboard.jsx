import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function QuizDashboard() {
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizTypes] = useState([
    { key: 'CT Quiz', label: 'CT Quiz' },
    { key: 'Semester Quiz', label: 'Semester Quiz' },
    { key: 'Lab & Sessional Quiz', label: 'Lab & Sessional Quiz' },
    { key: 'Practice Quiz', label: 'Practice Quiz' },
  ]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['Odd Semester', 'Even Semester'];

  useEffect(() => {
    if (year && semester) {
      api.get('/categories').then(res => {
        const c = res.data.filter(cat => cat.year === year && cat.semester === semester);
        setCourses(c);
        setSelectedCourse(null);
        setCourseQuizzes([]);
      });
    }
  }, [year, semester]);

  useEffect(() => {
    if (selectedCourse && selectedCourse.quizzes) {
      setCourseQuizzes(selectedCourse.quizzes);
    } else {
      setCourseQuizzes([]);
    }
  }, [selectedCourse]);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', color: '#1a1a2e' }}>RUET ECE Quiz Dashboard</h1>
      <p style={{ color: '#777', marginBottom: '1.5rem' }}>Select year, semester, course, then quiz type.</p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Year</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {years.map(y => (
            <button key={y} onClick={() => setYear(y)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: year === y ? '2px solid #e94560' : '1px solid #ddd', background: year === y ? '#fff0f3' : '#fff', cursor: 'pointer', fontWeight: 500 }}>{y}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Semester</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {semesters.map(s => (
            <button key={s} onClick={() => setSemester(s)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: semester === s ? '2px solid #e94560' : '1px solid #ddd', background: semester === s ? '#fff0f3' : '#fff', cursor: 'pointer', fontWeight: 500 }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Course</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {courses.map(c => (
            <button key={c.id} onClick={() => setSelectedCourse(c)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: selectedCourse?.id === c.id ? '2px solid #e94560' : '1px solid #ddd', background: selectedCourse?.id === c.id ? '#fff0f3' : '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>{c.course_code || c.name}</button>
          ))}
          {courses.length === 0 && year && semester && <span style={{ color: '#777', fontSize: '0.9rem' }}>No courses found. Check database seed.</span>}
        </div>
      </div>

      {selectedCourse && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', color: '#1a1a2e' }}>{selectedCourse.course_code || selectedCourse.name}</h3>
          <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '1rem' }}>{selectedCourse.course_title || selectedCourse.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {quizTypes.map(qt => {
              const real = courseQuizzes.find(q => q.quiz_type === qt.key);
              return real ? (
                <Link key={qt.key} to={`/quiz/${real.id}`} style={{ padding: '0.75rem 1rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{qt.label}</Link>
              ) : (
                <button key={qt.key} disabled style={{ padding: '0.75rem 1rem', background: '#ccc', color: '#777', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 500 }}>{qt.label} — not added</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
