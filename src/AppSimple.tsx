import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DebugApp from "./components/DebugApp";

const AppSimple = () => {
  console.log('AppSimple: Starting render');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DebugApp />} />
        <Route path="/debug" element={<DebugApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppSimple;
