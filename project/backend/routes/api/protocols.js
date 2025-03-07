const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * @route   GET api/protocols
 * @desc    Get all protocols with pagination
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = ['1=1']; // Always true condition to start with
    const queryParams = [];
    let paramCount = 1;
    
    // Filter by status if provided
    if (req.query.status) {
      conditions.push(`status = $${paramCount}`);
      queryParams.push(req.query.status);
      paramCount++;
    }
    
    // Filter by company if provided
    if (req.query.company) {
      conditions.push(`company = $${paramCount}`);
      queryParams.push(req.query.company);
      paramCount++;
    }
    
    // Filter by therapeutic area if provided
    if (req.query.therapeuticArea) {
      conditions.push(`therapeutic_area = $${paramCount}`);
      queryParams.push(req.query.therapeuticArea);
      paramCount++;
    }
    
    // Filter by phase if provided
    if (req.query.phase) {
      conditions.push(`phase = $${paramCount}`);
      queryParams.push(req.query.phase);
      paramCount++;
    }
    
    // Search by title or molecule name
    if (req.query.search) {
      conditions.push(`(title ILIKE $${paramCount} OR molecule_name ILIKE $${paramCount})`);
      queryParams.push(`%${req.query.search}%`);
      paramCount++;
    }
    
    // Filter by creator or team member
    if (req.query.createdBy) {
      conditions.push(`created_by = $${paramCount}`);
      queryParams.push(req.query.createdBy);
      paramCount++;
    } else {
      // Default to protocols created by the current user or where they are a team member
      conditions.push(`(created_by = $${paramCount} OR id IN (
        SELECT protocol_id FROM protocol_team_members WHERE user_id = $${paramCount}
      ))`);
      queryParams.push(req.user.id);
      paramCount++;
    }
    
    // Build the WHERE clause
    const whereClause = conditions.join(' AND ');
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM protocols 
      WHERE ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    // Get protocols with pagination
    const protocolsQuery = `
      SELECT 
        p.id, 
        p.title, 
        p.status, 
        p.molecule_name, 
        p.phase, 
        p.therapeutic_area, 
        p.condition, 
        p.company, 
        p.created_at, 
        p.updated_at,
        u.name as creator_name,
        u.email as creator_email
      FROM protocols p
      JOIN users u ON p.created_by = u.id
      WHERE ${whereClause}
      ORDER BY p.updated_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    queryParams.push(limit, offset);
    
    const protocolsResult = await pool.query(protocolsQuery, queryParams);
    
    res.json({
      protocols: protocolsResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET api/protocols/:id
 * @desc    Get protocol by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // Get protocol details
    const protocolQuery = `
      SELECT 
        p.*,
        u.name as creator_name,
        u.email as creator_email
      FROM protocols p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `;
    
    const protocolResult = await pool.query(protocolQuery, [req.params.id]);
    
    if (protocolResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = protocolResult.rows[0];
    
    // Check if user has access to this protocol
    const hasAccess = 
      protocol.created_by === req.user.id || 
      await isTeamMember(req.params.id, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Get team members
    const teamQuery = `
      SELECT 
        tm.user_id, 
        tm.role, 
        tm.permissions,
        u.name, 
        u.email
      FROM protocol_team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.protocol_id = $1
    `;
    
    const teamResult = await pool.query(teamQuery, [req.params.id]);
    protocol.team_members = teamResult.rows;
    
    // Get objectives
    const objectivesQuery = `
      SELECT * FROM protocol_objectives
      WHERE protocol_id = $1
    `;
    
    const objectivesResult = await pool.query(objectivesQuery, [req.params.id]);
    protocol.objectives = objectivesResult.rows;
    
    // Get associated sites
    const sitesQuery = `
      SELECT 
        ps.*,
        s.doctor_id,
        s.first_name,
        s.last_name,
        s.email,
        s.specialty_description
      FROM protocol_sites ps
      JOIN sites s ON ps.site_id = s.id
      WHERE ps.protocol_id = $1
    `;
    
    const sitesResult = await pool.query(sitesQuery, [req.params.id]);
    protocol.sites = sitesResult.rows;
    
    res.json(protocol);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/protocols
 * @desc    Create a new protocol
 * @access  Private
 */
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('molecule_name', 'Molecule name is required').not().isEmpty(),
    check('phase', 'Trial phase is required').not().isEmpty(),
    check('therapeutic_area', 'Therapeutic area is required').not().isEmpty(),
    check('condition', 'Condition is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Begin transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert protocol
    const insertQuery = `
      INSERT INTO protocols (
        title, 
        molecule_name, 
        molecule_description, 
        molecule_type, 
        phase, 
        therapeutic_area, 
        condition, 
        company, 
        created_by,
        template_used,
        protocol_outline,
        uncertainty_flags,
        study_design,
        criteria,
        endpoints
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    
    const insertValues = [
      req.body.title,
      req.body.molecule_name,
      req.body.molecule_description || null,
      req.body.molecule_type || null,
      req.body.phase,
      req.body.therapeutic_area,
      req.body.condition,
      req.body.company,
      req.user.id,
      req.body.template_used || null,
      req.body.protocol_outline || null,
      req.body.uncertainty_flags ? JSON.stringify(req.body.uncertainty_flags) : null,
      req.body.study_design ? JSON.stringify(req.body.study_design) : null,
      req.body.criteria ? JSON.stringify(req.body.criteria) : null,
      req.body.endpoints ? JSON.stringify(req.body.endpoints) : null
    ];
    
    const result = await client.query(insertQuery, insertValues);
    const protocol = result.rows[0];
    
    // Insert objectives if provided
    if (req.body.objectives && Array.isArray(req.body.objectives)) {
      for (const objective of req.body.objectives) {
        const objectiveQuery = `
          INSERT INTO protocol_objectives (
            protocol_id, 
            type, 
            description, 
            endpoints, 
            timepoints
          ) VALUES ($1, $2, $3, $4, $5)
        `;
        
        await client.query(objectiveQuery, [
          protocol.id,
          objective.type,
          objective.description,
          objective.endpoints ? JSON.stringify(objective.endpoints) : null,
          objective.timepoints ? JSON.stringify(objective.timepoints) : null
        ]);
      }
    }
    
    // Insert team members if provided
    if (req.body.team_members && Array.isArray(req.body.team_members)) {
      for (const member of req.body.team_members) {
        const teamQuery = `
          INSERT INTO protocol_team_members (
            protocol_id, 
            user_id, 
            role, 
            permissions
          ) VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(teamQuery, [
          protocol.id,
          member.user_id,
          member.role || null,
          member.permissions || 'view'
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json(protocol);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

/**
 * @route   PUT api/protocols/:id
 * @desc    Update a protocol
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if protocol exists and user has permission
    const checkQuery = `
      SELECT created_by FROM protocols
      WHERE id = $1
    `;
    
    const checkResult = await client.query(checkQuery, [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = checkResult.rows[0];
    
    // Check if user is authorized to update
    if (protocol.created_by !== req.user.id) {
      const teamQuery = `
        SELECT permissions FROM protocol_team_members
        WHERE protocol_id = $1 AND user_id = $2
        AND permissions IN ('edit', 'admin')
      `;
      
      const teamResult = await client.query(teamQuery, [req.params.id, req.user.id]);
      
      if (teamResult.rows.length === 0) {
        return res.status(403).json({ msg: 'Not authorized to update this protocol' });
      }
    }
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    // List of fields that can be updated
    const allowedFields = [
      'title', 'version', 'status',
      'molecule_name', 'molecule_description', 'molecule_type', 'molecule_mechanism', 'molecule_structure',
      'phase', 'therapeutic_area', 'condition', 
      'study_design', 'criteria', 'endpoints',
      'company', 'template_used', 'protocol_outline', 'uncertainty_flags',
      'compliance_score', 'compliance_issues', 'generated_document_url'
    ];
    
    // Add each provided field to the update query
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Convert JSON fields
        if (['study_design', 'criteria', 'endpoints', 'uncertainty_flags', 'compliance_issues'].includes(field) && 
            req.body[field] !== null) {
          updateFields.push(`${field.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramCount}`);
          updateValues.push(JSON.stringify(req.body[field]));
        } else {
          updateFields.push(`${field.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramCount}`);
          updateValues.push(req.body[field]);
        }
        paramCount++;
      }
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());
    paramCount++;
    
    // Build and execute update query if there are fields to update
    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE protocols
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      updateValues.push(req.params.id);
      
      const updateResult = await client.query(updateQuery, updateValues);
      const updatedProtocol = updateResult.rows[0];
      
      // Update objectives if provided
      if (req.body.objectives && Array.isArray(req.body.objectives)) {
        // Delete existing objectives
        await client.query('DELETE FROM protocol_objectives WHERE protocol_id = $1', [req.params.id]);
        
        // Insert new objectives
        for (const objective of req.body.objectives) {
          const objectiveQuery = `
            INSERT INTO protocol_objectives (
              protocol_id, 
              type, 
              description, 
              endpoints, 
              timepoints
            ) VALUES ($1, $2, $3, $4, $5)
          `;
          
          await client.query(objectiveQuery, [
            req.params.id,
            objective.type,
            objective.description,
            objective.endpoints ? JSON.stringify(objective.endpoints) : null,
            objective.timepoints ? JSON.stringify(objective.timepoints) : null
          ]);
        }
      }
      
      // Update team members if provided
      if (req.body.team_members && Array.isArray(req.body.team_members)) {
        // Delete existing team members
        await client.query('DELETE FROM protocol_team_members WHERE protocol_id = $1', [req.params.id]);
        
        // Insert new team members
        for (const member of req.body.team_members) {
          const teamQuery = `
            INSERT INTO protocol_team_members (
              protocol_id, 
              user_id, 
              role, 
              permissions
            ) VALUES ($1, $2, $3, $4)
          `;
          
          await client.query(teamQuery, [
            req.params.id,
            member.user_id,
            member.role || null,
            member.permissions || 'view'
          ]);
        }
      }
      
      // Add to history table
      const historyQuery = `
        INSERT INTO protocol_history (
          protocol_id,
          version,
          changed_by,
          changes,
          document_snapshot
        ) VALUES ($1, $2, $3, $4, $5)
      `;
      
      await client.query(historyQuery, [
        req.params.id,
        updatedProtocol.version,
        req.user.id,
        'Protocol updated',
        JSON.stringify(updatedProtocol)
      ]);
      
      await client.query('COMMIT');
      res.json(updatedProtocol);
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({ msg: 'No valid fields to update' });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

/**
 * @route   DELETE api/protocols/:id
 * @desc    Delete a protocol
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if protocol exists and user has permission
    const checkQuery = `
      SELECT created_by FROM protocols
      WHERE id = $1
    `;
    
    const checkResult = await client.query(checkQuery, [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = checkResult.rows[0];
    
    // Check if user is authorized to delete
    if (protocol.created_by !== req.user.id) {
      const teamQuery = `
        SELECT permissions FROM protocol_team_members
        WHERE protocol_id = $1 AND user_id = $2
        AND permissions = 'admin'
      `;
      
      const teamResult = await client.query(teamQuery, [req.params.id, req.user.id]);
      
      if (teamResult.rows.length === 0) {
        return res.status(403).json({ msg: 'Not authorized to delete this protocol' });
      }
    }
    
    // Delete protocol and all related data (cascade will handle related tables)
    const deleteQuery = `
      DELETE FROM protocols
      WHERE id = $1
    `;
    
    await client.query(deleteQuery, [req.params.id]);
    
    await client.query('COMMIT');
    
    res.json({ msg: 'Protocol removed' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

/**
 * @route   POST api/protocols/:id/compliance-check
 * @desc    Run compliance check on a protocol
 * @access  Private
 */
router.post('/:id/compliance-check', auth, async (req, res) => {
  try {
    // Check if protocol exists and user has access
    const protocolQuery = `
      SELECT id, created_by FROM protocols
      WHERE id = $1
    `;
    
    const protocolResult = await pool.query(protocolQuery, [req.params.id]);
    
    if (protocolResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = protocolResult.rows[0];
    
    // Check if user has access
    const hasAccess = 
      protocol.created_by === req.user.id || 
      await isTeamMember(req.params.id, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // This would call an AI service for compliance checking
    // For now, simulate with sample data
    const complianceScore = Math.floor(Math.random() * (100 - 70) + 70);
    const complianceIssues = [];
    
    if (complianceScore < 95) {
      // Generate some sample issues
      const categories = ['ethics', 'scientific', 'regulatory', 'procedural', 'statistical', 'operational'];
      const severities = ['high', 'medium', 'low'];
      const locations = ['Introduction', 'Objectives', 'Study Design', 'Endpoints', 'Statistical Analysis'];
      
      // Generate 1-5 random issues
      const issueCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < issueCount; i++) {
        complianceIssues.push({
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `Sample compliance issue ${i+1}`,
          severity: severities[Math.floor(Math.random() * severities.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          status: 'open'
        });
      }
    }
    
    // Update protocol with compliance data
    const updateQuery = `
      UPDATE protocols
      SET compliance_score = $1, compliance_issues = $2
      WHERE id = $3
    `;
    
    await pool.query(updateQuery, [
      complianceScore,
      JSON.stringify(complianceIssues),
      req.params.id
    ]);
    
    res.json({
      complianceScore,
      complianceIssues
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/protocols/:id/site-matching
 * @desc    Find matching sites for a protocol
 * @access  Private
 */
router.post('/:id/site-matching', auth, async (req, res) => {
  try {
    // Check if protocol exists and user has access
    const protocolQuery = `
      SELECT 
        id, 
        created_by, 
        therapeutic_area,
        phase,
        condition
      FROM protocols
      WHERE id = $1
    `;
    
    const protocolResult = await pool.query(protocolQuery, [req.params.id]);
    
    if (protocolResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = protocolResult.rows[0];
    
    // Check if user has access
    const hasAccess = 
      protocol.created_by === req.user.id || 
      await isTeamMember(req.params.id, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Find matching sites
    // Query sites with therapeutic area experience
    const sitesQuery = `
      SELECT 
        s.id, 
        s.doctor_id, 
        s.first_name, 
        s.last_name, 
        s.email, 
        s.specialty_description,
        s.license_state,
        sl.city, 
        sl.state, 
        sl.latitude, 
        sl.longitude,
        te.area,
        te.trial_count,
        te.is_specialization,
        ste.phase1_count,
        ste.phase2_count,
        ste.phase3_count,
        ste.phase4_count,
        sm.recruitment_rate,
        sm.retention_rate
      FROM sites s
      LEFT JOIN site_locations sl ON s.id = sl.site_id AND sl.is_primary = true
      LEFT JOIN therapeutic_experience te ON s.id = te.site_id AND te.area = $1
      LEFT JOIN site_trial_experience ste ON s.id = ste.site_id
      LEFT JOIN site_metrics sm ON s.id = sm.site_id
      WHERE s.is_active = true
      LIMIT 20
    `;
    
    const sitesResult = await pool.query(sitesQuery, [protocol.therapeutic_area]);
    
    // Calculate compatibility scores for each site
    const matchedSites = [];
    
    for (const site of sitesResult.rows) {
      // In a real implementation, this would use AI or a complex algorithm
      // For now, use a simplified scoring approach
      const strengths = [];
      const weaknesses = [];
      
      // Check therapeutic area experience
      if (site.area === protocol.therapeutic_area) {
        strengths.push(`Experience in ${protocol.therapeutic_area}`);
      } else {
        weaknesses.push(`Limited experience in ${protocol.therapeutic_area}`);
      }
      
      // Check phase experience
      const phaseKey = `phase${protocol.phase.toLowerCase().replace(/\s+/g, '')}_count`;
      if (site[phaseKey] > 3) {
        strengths.push(`Strong ${protocol.phase} experience`);
      } else {
        weaknesses.push(`Limited ${protocol.phase} experience`);
      }
      
      // Calculate compatibility score (simplified)
      let score = 3; // baseline score
      score += strengths.length * 0.5;
      score -= weaknesses.length * 0.3;
      
      // Ensure score is within bounds
      score = Math.max(1, Math.min(5, score));
      
      // Save compatibility score in database
      const scoreQuery = `
        INSERT INTO protocol_sites (
          protocol_id,
          site_id,
          status,
          compatibility_score,
          strengths,
          weaknesses,
          recruitment_potential
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (protocol_id, site_id) 
        DO UPDATE SET 
          compatibility_score = EXCLUDED.compatibility_score,
          strengths = EXCLUDED.strengths,
          weaknesses = EXCLUDED.weaknesses,
          recruitment_potential = EXCLUDED.recruitment_potential,
          updated_at = NOW()
        RETURNING id
      `;
      
      const recruitmentPotential = Math.floor(Math.random() * 100);
      
      await pool.query(scoreQuery, [
        protocol.id,
        site.id,
        'selected',
        score,
        JSON.stringify(strengths),
        JSON.stringify(weaknesses),
        recruitmentPotential
      ]);
      
      // Add to results
      matchedSites.push({
        doctor_id: site.doctor_id,
        first_name: site.first_name,
        last_name: site.last_name,
        specialty_description: site.specialty_description,
        locations: [{
          city: site.city,
          state: site.state,
          latitude: site.latitude,
          longitude: site.longitude
        }],
        email: site.email,
        compatibility: {
          score,
          strengths,
          weaknesses
        },
        recruitment_potential: recruitmentPotential
      });
    }
    
    // Sort by compatibility score
    matchedSites.sort((a, b) => b.compatibility.score - a.compatibility.score);
    
    res.json(matchedSites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST api/protocols/:id/generate-pdf
 * @desc    Generate PDF for a protocol
 * @access  Private
 */
router.post('/:id/generate-pdf', auth, async (req, res) => {
  try {
    // Check if protocol exists and user has access
    const protocolQuery = `
      SELECT id, created_by FROM protocols
      WHERE id = $1
    `;
    
    const protocolResult = await pool.query(protocolQuery, [req.params.id]);
    
    if (protocolResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Protocol not found' });
    }
    
    const protocol = protocolResult.rows[0];
    
    // Check if user has access
    const hasAccess = 
      protocol.created_by === req.user.id || 
      await isTeamMember(req.params.id, req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // In a real implementation, this would generate a PDF file
    // For now, simulate with a download URL
    const generatedDocumentUrl = `/api/protocols/${protocol.id}/download-pdf`;
    
    // Update protocol with document URL
    const updateQuery = `
      UPDATE protocols
      SET generated_document_url = $1
      WHERE id = $2
    `;
    
    await pool.query(updateQuery, [generatedDocumentUrl, req.params.id]);
    
    res.json({ url: generatedDocumentUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to check if a user is a team member of a protocol
async function isTeamMember(protocolId, userId) {
  const query = `
    SELECT 1 FROM protocol_team_members
    WHERE protocol_id = $1 AND user_id = $2
    LIMIT 1
  `;
  
  const result = await pool.query(query, [protocolId, userId]);
  return result.rows.length > 0;
}

module.exports = router; 