import { useEffect, useState } from 'react';
import './App.css';

const emptyForm = {
  title: '',
  content: '',
  favorite: false,
  tags: '',
};

function App() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('notes-theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('notes-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAIRequest = async (mode) => {
    if (!form.content.trim()) {
      alert('Write a note before asking for AI suggestions.');
      return;
    }

    setAiLoading(mode);

    try {
      const response = await fetch('http://localhost:5000/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: form.content,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'AI request failed');
      }

      if (mode === 'title') {
        setForm((prev) => ({ ...prev, title: data.output || prev.title }));
      }

      if (mode === 'summary') {
        setForm((prev) => ({ ...prev, content: data.output || prev.content }));
      }

      if (mode === 'tags') {
        const builtTags = Array.isArray(data.output) ? data.output.join(', ') : String(data.output || '');
        setForm((prev) => ({ ...prev, tags: builtTags }));
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      alert('AI suggestion failed. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: form.title,
      content: form.content,
      favorite: form.favorite,
      tags: form.tags,
    };

    const url = editingId
      ? `http://localhost:5000/api/notes/${editingId}`
      : 'http://localhost:5000/api/notes';

    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note._id);
    setForm({
      title: note.title,
      content: note.content,
      favorite: note.favorite,
      tags: note.tags ? note.tags.join(', ') : '',
    });
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: 'DELETE',
      });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Notes App</h1>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="note-form">
          <input
            type="text"
            name="title"
            placeholder="Note title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="content"
            placeholder="Write your note..."
            value={form.content}
            onChange={handleChange}
            rows="6"
            required
          />

          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange}
          />

          <div className="ai-actions">
            <button type="button" className="ai-btn" onClick={() => handleAIRequest('title')} disabled={aiLoading !== null}>
              {aiLoading === 'title' ? 'Generating...' : 'AI Title'}
            </button>
            <button type="button" className="ai-btn" onClick={() => handleAIRequest('summary')} disabled={aiLoading !== null}>
              {aiLoading === 'summary' ? 'Generating...' : 'AI Summary'}
            </button>
            <button type="button" className="ai-btn" onClick={() => handleAIRequest('tags')} disabled={aiLoading !== null}>
              {aiLoading === 'tags' ? 'Generating...' : 'AI Tags'}
            </button>
          </div>

          <label className="favorite-row">
            <input
              type="checkbox"
              name="favorite"
              checked={form.favorite}
              onChange={handleChange}
            />
            Favorite
          </label>

          <button type="submit" className="primary-btn">
            {editingId ? 'Update Note' : 'Add Note'}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </aside>

      <main className="notes-panel">
        <h2>Your Notes</h2>

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Add one to begin.</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article key={note._id} className={`note-card ${note.favorite ? 'favorite' : ''}`}>
                <div className="note-header">
                  <h3>{note.title}</h3>
                  {note.favorite && <span className="badge">★ Favorite</span>}
                </div>

                <p>{note.content}</p>

                {note.tags?.length > 0 && (
                  <div className="tag-list">
                    {note.tags.map((tag) => (
                      <span key={tag} className="tag-item">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="note-actions">
                  <button type="button" onClick={() => handleEdit(note)}>Edit</button>
                  <button type="button" className="danger" onClick={() => handleDelete(note._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
