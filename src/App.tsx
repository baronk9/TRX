/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import COTReportPage from './components/COTReportPage';
import COTAssetDetailPage from './components/COTAssetDetailPage';
import EconomicIndicatorsPage from './components/EconomicIndicatorsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cot-report" element={<COTReportPage />} />
        <Route path="/cot-report/:symbol" element={<COTAssetDetailPage />} />
        <Route path="/economic-indicators" element={<EconomicIndicatorsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
