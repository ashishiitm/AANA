const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for inclusion/exclusion criteria
const CriteriaSchema = new Schema({
  category: {
    type: String,
    enum: ['inclusion', 'exclusion'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rationale: String,
  order: Number
});

// Schema for study objectives
const ObjectiveSchema = new Schema({
  type: {
    type: String,
    enum: ['primary', 'secondary', 'exploratory'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  endpoints: [String],
  timepoints: [String]
});

// Schema for protocol document
const ProtocolSchema = new Schema({
  // Basic protocol metadata
  title: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'active', 'completed', 'terminated'],
    default: 'draft'
  },
  
  // Molecule information
  molecule: {
    name: {
      type: String,
      required: true
    },
    description: String,
    type: String,
    mechanism: String,
    structure: String
  },
  
  // Clinical trial information
  trial: {
    phase: {
      type: String,
      enum: ['Phase 1', 'Phase 1/2', 'Phase 2', 'Phase 2/3', 'Phase 3', 'Phase 4'],
      required: true
    },
    therapeuticArea: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      required: true
    },
    objectives: [ObjectiveSchema],
    studyDesign: {
      type: {
        type: [String],
        enum: ['Randomized', 'Double-blind', 'Placebo-controlled', 'Parallel', 'Crossover', 'Open-label', 'Single-arm']
      },
      population: {
        ageRange: [Number], // [min, max]
        gender: {
          type: String,
          enum: ['Male', 'Female', 'Both']
        },
        healthStatus: String
      },
      duration: String,
      numberOfArms: Number,
      treatmentGroups: [{
        name: String,
        description: String,
        dosage: String,
        route: String,
        schedule: String,
        duration: String
      }]
    },
    criteria: [CriteriaSchema],
    endpoints: {
      primary: [String],
      secondary: [String],
      exploratory: [String]
    }
  },
  
  // Company and user information
  company: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    permissions: {
      type: String,
      enum: ['view', 'edit', 'approve', 'admin']
    }
  }],
  
  // Content and generation information
  templateUsed: String,
  protocolOutline: String,
  uncertaintyFlags: [String],
  complianceScore: Number,
  complianceIssues: [{
    category: String,
    description: String,
    severity: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    location: String,
    status: {
      type: String,
      enum: ['open', 'resolved', 'waived']
    }
  }],
  
  // Site selection information
  sites: [{
    siteId: {
      type: Schema.Types.ObjectId,
      ref: 'Site'
    },
    status: {
      type: String,
      enum: ['selected', 'contacted', 'confirmed', 'active', 'completed', 'withdrawn']
    },
    contactDate: Date,
    confirmationDate: Date,
    compatibilityScore: Number,
    recruitmentPotential: Number
  }],
  
  // Document management
  generatedDocumentUrl: String,
  history: [{
    version: String,
    date: Date,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changes: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
ProtocolSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Protocol', ProtocolSchema); 