const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Address/location schema
const LocationSchema = new Schema({
  address1: String,
  address2: String,
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: String,
  country: {
    type: String,
    default: 'USA'
  },
  latitude: Number,
  longitude: Number,
  isPrimary: {
    type: Boolean,
    default: false
  }
});

// Schema for site metrics
const SiteMetricsSchema = new Schema({
  recruitmentRate: Number, // patients per month
  screenFailureRate: Number, // percentage
  retentionRate: Number, // percentage
  dataQualityScore: Number, // 0-100
  startupTime: Number, // days
  pastTrialCount: Number,
  completedTrialCount: Number,
  avgEnrollmentEfficiency: Number, // percentage of target achieved
  lastUpdated: Date
});

// Schema for therapeutic area experience
const TherapeuticExperienceSchema = new Schema({
  area: {
    type: String,
    required: true
  },
  trialCount: Number,
  patientCount: Number,
  specialization: {
    type: Boolean,
    default: false
  },
  publications: Number
});

// Schema for site/investigator
const SiteSchema = new Schema({
  // Basic information
  doctor_id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  credentials: [String],
  email: {
    type: String,
    required: true
  },
  phone: String,
  
  // Site information
  site_name: String,
  locations: [LocationSchema],
  specialty_description: {
    type: String,
    required: true
  },
  sub_specialties: [String],
  license_state: String,
  license_number: String,
  npi_number: String,
  
  // Experience and metrics
  years_experience: Number,
  trial_experience: {
    phase1: Number,
    phase2: Number,
    phase3: Number,
    phase4: Number
  },
  therapeutic_experience: [TherapeuticExperienceSchema],
  patient_demographics: {
    age_ranges: {
      pediatric: Number, // percentage
      adult: Number, // percentage
      geriatric: Number // percentage
    },
    gender_distribution: {
      male: Number, // percentage
      female: Number // percentage
    },
    ethnicity_distribution: Schema.Types.Mixed // flexible object with percentages
  },
  metrics: SiteMetricsSchema,
  
  // Compliance and regulatory
  certifications: [String],
  irb_affiliations: [String],
  fda_warning_letters: Number,
  good_standing: {
    type: Boolean,
    default: true
  },
  
  // Trial history
  previous_trials: [{
    trial_id: String,
    therapeutic_area: String,
    phase: String,
    year_completed: Number,
    patients_enrolled: Number,
    performance_rating: Number // 1-5
  }],
  
  // Matching and scoring
  compatibility_scores: [{
    protocol_id: {
      type: Schema.Types.ObjectId,
      ref: 'Protocol'
    },
    score: Number,
    strengths: [String],
    weaknesses: [String],
    calculated_at: Date
  }],
  
  // Communication and outreach
  outreach_history: [{
    protocol_id: {
      type: Schema.Types.ObjectId,
      ref: 'Protocol'
    },
    date: Date,
    method: {
      type: String,
      enum: ['email', 'phone', 'mail', 'in-person']
    },
    status: {
      type: String,
      enum: ['sent', 'received', 'responded', 'declined', 'accepted']
    },
    response_date: Date,
    notes: String
  }],
  
  // Active status
  is_active: {
    type: Boolean,
    default: true
  },
  
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
SiteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for name search
SiteSchema.index({ first_name: 'text', last_name: 'text', site_name: 'text' });

// Create compound index for location search
SiteSchema.index({ 'locations.state': 1, 'locations.city': 1 });

// Create index for compatibility score search
SiteSchema.index({ 'compatibility_scores.score': -1 });

module.exports = mongoose.model('Site', SiteSchema); 