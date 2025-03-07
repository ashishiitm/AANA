import { createServer, Model } from 'miragejs';

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    models: {
      study: Model,
      condition: Model,
      location: Model,
    },

    seeds(server) {
      // Seed some initial data
      server.create('study', {
        study_id: 'NCT01234567',
        official_title: 'A Phase 3 Study of New Drug for Diabetes Treatment',
        overall_status: 'RECRUITING',
        condition: 'Type 2 Diabetes',
        location: 'Boston, MA',
        brief_summary: 'This study evaluates the efficacy and safety of a new drug for treating type 2 diabetes in adults.'
      });
      
      server.create('study', {
        study_id: 'NCT02345678',
        official_title: 'Evaluation of Immunotherapy in Advanced Lung Cancer',
        overall_status: 'ACTIVE',
        condition: 'Lung Cancer',
        location: 'New York, NY',
        brief_summary: 'This trial studies how well immunotherapy works in treating patients with advanced lung cancer.'
      });
      
      server.create('study', {
        study_id: 'NCT03456789',
        official_title: 'Novel Treatment Approach for Alzheimer\'s Disease',
        overall_status: 'RECRUITING',
        condition: 'Alzheimer\'s Disease',
        location: 'San Francisco, CA',
        brief_summary: 'This study tests a new approach to treating early-stage Alzheimer\'s disease.'
      });

      // Add more studies as needed
      for (let i = 0; i < 50; i++) {
        const conditions = ['Diabetes', 'Cancer', 'Alzheimer\'s', 'Heart Disease', 'COVID-19', 'Asthma', 'Arthritis'];
        const locations = ['New York', 'Boston', 'San Francisco', 'Chicago', 'Houston', 'Los Angeles', 'Miami'];
        const statuses = ['RECRUITING', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'NOT_YET_RECRUITING'];
        
        server.create('study', {
          study_id: `NCT${Math.floor(10000000 + Math.random() * 90000000)}`,
          official_title: `Study ${i + 4} for ${conditions[Math.floor(Math.random() * conditions.length)]}`,
          overall_status: statuses[Math.floor(Math.random() * statuses.length)],
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          brief_summary: `This is a mock study ${i + 4} for testing purposes.`
        });
      }
    },

    routes() {
      this.namespace = 'api';
      
      // Get all studies
      this.get('/studies', (schema) => {
        return schema.studies.all();
      });
      
      // Get active trials
      this.get('/studies/active', (schema) => {
        return schema.studies.where((study) => 
          study.overall_status === 'RECRUITING' || study.overall_status === 'ACTIVE'
        );
      });
      
      // Get featured studies
      this.get('/studies/featured', (schema) => {
        const allStudies = schema.studies.all().models;
        // Randomly select 3 studies as featured
        const shuffled = [...allStudies].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
      });
      
      // Database statistics endpoint
      this.get('/stats/database', (schema) => {
        const allStudies = schema.studies.all().models;
        const recruitingTrials = allStudies.filter(study => study.attrs.overall_status === 'RECRUITING').length;
        const completedTrials = allStudies.filter(study => study.attrs.overall_status === 'COMPLETED').length;
        const suspendedTrials = allStudies.filter(study => study.attrs.overall_status === 'SUSPENDED').length;
        
        // Calculate top conditions
        const conditionCounts = {};
        allStudies.forEach(study => {
          const condition = study.attrs.condition;
          if (condition) {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          }
        });
        
        const topConditions = Object.entries(conditionCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Calculate top locations
        const locationCounts = {};
        allStudies.forEach(study => {
          const location = study.attrs.location;
          if (location) {
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          }
        });
        
        const topLocations = Object.entries(locationCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Recent updates (mock data)
        const recentUpdates = [
          { id: 'NCT12345678', title: 'New Diabetes Trial', date: '2023-03-01' },
          { id: 'NCT23456789', title: 'Cancer Immunotherapy Study', date: '2023-02-28' },
          { id: 'NCT34567890', title: 'Alzheimer\'s Prevention Trial', date: '2023-02-25' }
        ];
        
        return {
          totalTrials: allStudies.length,
          recruitingTrials,
          completedTrials,
          suspendedTrials,
          participantsEnrolled: Math.floor(allStudies.length * 120), // Mock data: average 120 participants per trial
          averageEnrollment: 120,
          topConditions,
          topLocations,
          recentUpdates
        };
      });
      
      // Add a route for fetching a specific study by ID with detailed information
      this.get("/api/study/:id", (schema, request) => {
        const id = request.params.id;
        const study = schema.studies.find(id);
        
        if (!study) {
          return new Response(404, {}, { error: "Study not found" });
        }
        
        // Add additional detailed information that might not be in the basic study object
        return {
          ...study.attrs,
          inclusion_criteria: "1. Age ≥ 18 years\n2. Diagnosed with condition for at least 6 months\n3. Stable medication regimen for at least 30 days prior to screening",
          exclusion_criteria: "1. Participation in another clinical trial within 30 days\n2. Known hypersensitivity to study medication\n3. Severe comorbid conditions",
          primary_outcome_measure: "Change in symptom severity from baseline to week 12",
          primary_outcome_description: "Measured using validated assessment scales and patient-reported outcomes",
          primary_outcome_time_frame: "12 weeks",
          secondary_outcome_measure: "Safety and tolerability of the treatment",
          secondary_outcome_description: "Assessed by monitoring adverse events, vital signs, and laboratory parameters",
          secondary_outcome_time_frame: "Throughout the 12-week treatment period and 4-week follow-up",
          participation_groups: "Treatment group and placebo control group",
          intervention_details: "Oral medication administered once daily for 12 weeks",
          primary_purpose: "Treatment",
          masking: "Double-blind (participant, investigator)",
          phase: study.attrs.phase || "Phase 2",
          sponsor: "Medical Research Institute",
          study_type: "Interventional",
          enrollment: "120 participants",
          start_date: "January 15, 2023",
          end_date: "December 31, 2023",
          completion_date: "March 15, 2024",
          central_contact: {
            name: "John Smith, MD",
            email: "john.smith@example.com",
            phone: "(555) 123-4567"
          },
          locations: [
            {
              facility: "University Medical Center",
              city: "Boston",
              state: "MA",
              country: "United States"
            },
            {
              facility: "Memorial Hospital",
              city: "New York",
              state: "NY",
              country: "United States"
            }
          ],
          collaborators: [
            "National Health Foundation",
            "Global Pharmaceutical Research"
          ],
          investigators: [
            {
              name: "Jane Doe, MD, PhD",
              role: "Principal Investigator"
            },
            {
              name: "Robert Johnson, MD",
              role: "Co-Investigator"
            }
          ]
        };
      });
      
      // Pass through any unhandled requests
      this.passthrough();
    },
  });

  return server;
} 