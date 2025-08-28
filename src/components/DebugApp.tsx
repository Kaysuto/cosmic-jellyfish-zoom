import React from 'react';

const DebugApp = () => {
  console.log('DebugApp: Component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1>Debug App - Application de test</h1>
      <p>Si vous voyez ceci, React fonctionne correctement.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Tests de base :</h2>
        <ul>
          <li>✅ React fonctionne</li>
          <li>✅ JSX fonctionne</li>
          <li>✅ Styles inline fonctionnent</li>
          <li>✅ Console.log fonctionne</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugApp;
