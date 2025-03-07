const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // For cross-origin resource sharing
const { spawn } = require('child_process'); // For calling Python scripts (optional for NLP)
const app = express();
const port = 3001; // You can change this port if needed

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all origins (adjust for production security)

// PostgreSQL connection
const pool = new Pool({
  user: 'ashish', // Your PostgreSQL username
  host: 'localhost', // Your PostgreSQL host
  database: 'trialmatch', // Your database name
  password: 'aana', // Your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Endpoint to fetch active and recruiting trials
app.get('/api/studies/active', async (req, res) => {
  try {
    const query = `
      SELECT s.study_id, s.nct_id, s.official_title, s.brief_summary, s.overall_status,
             stc.contact_name, stc.role, stc.phone, stc.email
      FROM studies s
      LEFT JOIN study_contacts stc ON s.study_id = stc.study_id
      WHERE s.overall_status IN ('RECRUITING', 'AVAILABLE')
      ORDER BY s.study_id DESC
      LIMIT 10;
    `;
    console.log('Executing PostgreSQL query:', query);
    const result = await pool.query(query);
    console.log('Query successful, returning:', result.rows.length, 'records');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trials:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch trials. Please try again later.' });
  }
});

// Endpoint for advanced search by conditions, location, disease, eligibility
app.get('/api/studies/search', async (req, res) => {
  const { conditions, location, disease, eligibility } = req.query;
  try {
    let query = `
      SELECT s.study_id, s.nct_id, s.official_title, s.brief_summary, s.overall_status,
             stc.contact_name, stc.role, stc.phone, stc.email
      FROM studies s
      LEFT JOIN study_conditions scn ON s.study_id = scn.study_id
      LEFT JOIN study_locations sl ON s.study_id = sl.study_id
      LEFT JOIN study_contacts stc ON s.study_id = stc.study_id
      WHERE 1=1
    `;
    const params = [];

    if (conditions) {
      query += ` AND scn.condition_name ILIKE $${params.length + 1}`;
      params.push(`%${conditions}%`);
    }
    if (location) {
      query += ` AND sl.location ILIKE $${params.length + 1}`;
      params.push(`%${location}%`);
    }
    if (disease) {
      query += ` AND (s.brief_summary ILIKE $${params.length + 1} OR s.official_title ILIKE $${params.length + 1})`;
      params.push(`%${disease}%`);
    }
    if (eligibility) {
      query += ` AND s.brief_summary ILIKE $${params.length + 1}`; // Simplified to search brief_summary for eligibility
      params.push(`%${eligibility}%`);
    }

    query += ` AND s.overall_status IN ('Recruiting', 'Active') ORDER BY s.study_id DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching trials:', error);
    res.status(500).json({ error: 'Failed to search trials. Please try again later.' });
  }
});

// Endpoint for NLP processing (using a Python script via child_process)
app.post('/api/nlp/process', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'No query provided' });
  }

  const pythonProcess = spawn('python3', ['/Users/ashish/AANA/core/nlp/nlp_script.py', query]);

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python script error:', errorOutput);
      return res.status(500).json({ error: 'NLP processing failed: ' + errorOutput });
    }
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      console.error('Invalid NLP response format:', e);
      res.status(500).json({ error: 'Invalid NLP response format: ' + e.message });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server. Please try again later.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});