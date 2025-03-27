import React from 'react';
import { SocketContext, socket } from './context/socket';
import AppRouter from './AppRouter';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <AppRouter />
    </SocketContext.Provider>
  );
}

export default App;
