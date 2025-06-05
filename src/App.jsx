import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header';
import Countries from './components/Countries';
import './App.css';
import PhonePrefixes from "./components/PhonePrefixes";

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/countries" element={<Countries />} />
                    <Route path="/prefixes" element={<PhonePrefixes />} />

                </Routes>
            </div>
        </Router>
    );
};

export default App;
