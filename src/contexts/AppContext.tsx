import React, { useState } from 'react';

import { AppContext } from '@/contexts/app-context';

// Backward-compatible re-export (prefer importing from @/hooks/use-app-context or @/hooks).
export { useAppContext } from '@/hooks/use-app-context';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
