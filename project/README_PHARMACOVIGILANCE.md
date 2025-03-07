# Pharmacovigilance Feature

## Overview

The Pharmacovigilance feature allows users to create and manage search rules for monitoring medical literature for adverse events related to specific drugs. The system automatically searches PubMed for relevant articles based on the defined search criteria and presents the results for review.

## Features

- **Search Rules**: Create, edit, and manage search rules with specific drug names, adverse event terms, and additional keywords.
- **Automated Searches**: Schedule searches to run automatically at defined intervals (daily, weekly, monthly).
- **Literature Review**: Review search results, mark articles as reviewed, and add notes.
- **Adverse Event Terms**: Manage a database of adverse event terms categorized by body system.

## Technical Implementation

### Frontend

The frontend is built with React and Material-UI, with the following main components:

- **Pharmacovigilance.js**: Main page displaying all search rules
- **CreateSearchRule.js**: Form for creating new search rules
- **EditSearchRule.js**: Form for editing existing search rules
- **SearchResults.js**: Page for viewing and reviewing search results

### Backend

The backend is implemented in Django with the following models:

- **PubmedArticle**: Stores article data from PubMed
- **AdverseEventTerm**: Stores adverse event terms with categories
- **SearchRule**: Defines search criteria and scheduling
- **SearchResult**: Links articles to search rules and tracks review status

### Services

- **PubMedService**: Handles interaction with the PubMed API
- **SearchService**: Executes searches based on search rules

## API Endpoints

### Search Rules

- `GET /api/pv/search-rules/`: List all search rules
- `POST /api/pv/search-rules/`: Create a new search rule
- `GET /api/pv/search-rules/{id}/`: Get a specific search rule
- `PUT /api/pv/search-rules/{id}/`: Update a search rule
- `DELETE /api/pv/search-rules/{id}/`: Delete a search rule
- `POST /api/pv/search-rules/{id}/run_search/`: Manually run a search
- `GET /api/pv/search-rules/{id}/get_results/`: Get results for a search rule

### Search Results

- `GET /api/pv/search-results/`: List all search results
- `GET /api/pv/search-results/{id}/`: Get a specific search result
- `POST /api/pv/search-results/{id}/mark_reviewed/`: Mark a result as reviewed

### Adverse Event Terms

- `GET /api/pv/adverse-event-terms/`: List all adverse event terms
- `GET /api/pv/adverse-event-terms/by_category/`: Get terms grouped by category

## Getting Started

1. Create adverse event terms in the admin interface or via API
2. Create a search rule with a drug name and relevant adverse event terms
3. Run the search manually or wait for scheduled execution
4. Review the results and mark articles as reviewed

## Future Enhancements

- Email notifications for new search results
- Export of search results to PDF or CSV
- Integration with regulatory reporting systems
- Advanced search criteria with Boolean logic
- Machine learning for relevance ranking of results 