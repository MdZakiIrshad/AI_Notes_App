import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from './models/Note.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notesdb';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 6);
  }

  if (typeof tags === 'string') {
    return [...new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))].slice(0, 6);
  }

  return [];
}

function cleanText(value) {
  return String(value || '').trim();
}

function buildFallbackAiOutput(content, mode) {
  const text = cleanText(content);

  if (!text) {
    return { output: '' };
  }

  if (mode === 'title') {
    const words = text
      .replace(/[#*_-]/g, ' ')
      .split(/\s+/)
      .slice(0, 8)
      .join(' ')
      .trim();

    return {
      output: words || 'Untitled note',
    };
  }

  if (mode === 'tags') {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !['this', 'that', 'with', 'from', 'into', 'your', 'have', 'will', 'note', 'notes', 'about', 'when', 'what', 'they', 'them'].includes(word));

    const unique = [...new Set(words)].slice(0, 5);

    return {
      output: unique.length ? unique : ['general', 'ideas'],
    };
  }

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(' ').trim();

  return {
    output: summary || text.slice(0, 180),
  };
}

async function generateAIInsight(content, mode) {
  const text = cleanText(content);

  if (!text) {
    throw new Error('Note content is required');
  }

  let prompt = '';

  if (mode === 'title') {
    prompt = `Create a short and clear title for this note. Return only the title text without quotes.\n\nNote:\n${text}`;
  } else if (mode === 'tags') {
    prompt = `Generate 3 to 5 short relevant tags for this note. Return only a comma-separated list without extra formatting.\n\nNote:\n${text}`;
  } else {
    prompt = `Summarize this note in 1 to 2 sentences. Return only the summary text.\n\nNote:\n${text}`;
  }

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data = await response.json();
    const generated = String(data?.response || '').trim();

    if (!generated) {
      return buildFallbackAiOutput(text, mode);
    }

    if (mode === 'tags') {
      return {
        output: generated
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 5),
      };
    }

    return {
      output: generated || buildFallbackAiOutput(text, mode).output,
    };
  } catch (error) {
    return buildFallbackAiOutput(text, mode);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
      const isAllowed = !origin || allowedOrigins.some((pattern) => pattern.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Notes API is running' });
});

app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { content, mode } = req.body;
    const selectedMode = mode || 'summary';
    const result = await generateAIInsight(content, selectedMode);

    res.json({
      success: true,
      mode: selectedMode,
      output: result.output,
      source: 'ollama',
    });
  } catch (error) {
    res.status(500).json({ message: 'AI suggestion failed', error: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, favorite, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const note = await Note.create({
      title,
      content,
      favorite: Boolean(favorite),
      tags: normalizeTags(tags),
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content, favorite, tags } = req.body;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, favorite: Boolean(favorite), tags: normalizeTags(tags) },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
