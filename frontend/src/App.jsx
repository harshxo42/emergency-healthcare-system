import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EmergencyRequest from './pages/EmergencyRequest.jsx';
import PatientsList from './pages/PatientsList.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#080c14] grid-bg flex flex-col antialiased">
        <Navigation />
        <div className="flex-1 w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dispatch" element={<EmergencyRequest />} />
            <Route path="/patients" element={<PatientsList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
