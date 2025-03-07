import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import StudyDetails from './pages/StudyDetails';
import Pharmacovigilance from './pages/Pharmacovigilance';
import CreateSearchRule from './pages/CreateSearchRule';
import EditSearchRule from './pages/EditSearchRule';
import SearchResultsPage from './pages/SearchResultsPage';
import TrialSearchResults from './pages/TrialSearchResults';
import ProtocolDesign from './pages/ProtocolDesign';
import Header from './components/Header';
import Footer from './components/Footer';
import Debug from './components/Debug';
import BackendStatusNotification from './components/BackendStatusNotification';
import { initEmailJS } from './utils/emailService';
import TrialDetailModal from './components/TrialDetailModal';
import ShareModal from './components/ShareModal';
import ApiTest from './components/ApiTest';
import DeepSeekTest from './components/DeepSeekTest';
import PromptOptimizer from './components/protocol/PromptOptimizer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  // eslint-disable-next-line no-unused-vars
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [trialToShare, setTrialToShare] = useState(null);

  useEffect(() => {
    // Initialize EmailJS when the app loads
    try {
      initEmailJS();
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }

    // Add event listener for share modal
    const handleShareEvent = (event) => {
      setTrialToShare(event.detail.trial);
      setShareModalOpen(true);
    };

    window.addEventListener('openShareModal', handleShareEvent);

    return () => {
      // ... existing cleanup code ...
      window.removeEventListener('openShareModal', handleShareEvent);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/study/:nctId" element={<StudyDetails />} />
              <Route path="/search" element={<Navigate to="/search-results" />} />
              <Route path="/search-results" element={<TrialSearchResults />} />
              
              {/* Pharmacovigilance Routes */}
              <Route path="/pharmacovigilance" element={<Pharmacovigilance />} />
              <Route path="/pharmacovigilance/create-rule" element={<CreateSearchRule />} />
              <Route path="/pharmacovigilance/edit-rule/:id" element={<EditSearchRule />} />
              <Route path="/pharmacovigilance/results/:id" element={<SearchResultsPage />} />
              
              {/* Product Routes */}
              <Route path="/enrollment" element={<Home />} /> {/* Placeholder */}
              <Route path="/protocol-design" element={<ProtocolDesign />} />
              <Route path="/protocol-design/prompts" element={<PromptOptimizer />} />
              <Route path="/deep-analytics" element={<Home />} /> {/* Placeholder */}
              
              {/* Use Cases Routes */}
              <Route path="/use-cases/sponsors" element={<Home />} /> {/* Placeholder */}
              <Route path="/use-cases/cros" element={<Home />} /> {/* Placeholder */}
              <Route path="/use-cases/sites" element={<Home />} /> {/* Placeholder */}
              
              {/* Pricing Routes */}
              <Route path="/pricing/packages" element={<Home />} /> {/* Placeholder */}
              <Route path="/pricing/enterprise" element={<Home />} /> {/* Placeholder */}
              <Route path="/pricing/contact" element={<Home />} /> {/* Placeholder */}
              
              {/* Partner Routes */}
              <Route path="/partner/technology" element={<Home />} /> {/* Placeholder */}
              <Route path="/partner/join" element={<Home />} /> {/* Placeholder */}
              <Route path="/partner/success-stories" element={<Home />} /> {/* Placeholder */}
              
              {/* Company Routes */}
              <Route path="/company/leadership" element={<Home />} /> {/* Placeholder */}
              <Route path="/company/careers" element={<Home />} /> {/* Placeholder */}
              <Route path="/company/contact" element={<Home />} /> {/* Placeholder */}
              
              {/* API Test Route */}
              <Route path="/api-test" element={<ApiTest />} />
              <Route path="/deepseek-test" element={<DeepSeekTest />} />
            </Routes>
          </main>
          <Footer />
          <Debug />
          <BackendStatusNotification />
          
          {/* Trial Detail Modal */}
          <TrialDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            trial={selectedTrial}
          />
          
          {/* Share Modal */}
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            trial={trialToShare}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 