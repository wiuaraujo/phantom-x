"use client";

import React, { createContext, useContext, useState } from "react";

interface DashboardNavContextType {
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DashboardNavContext = createContext<DashboardNavContextType>({
  mobileDrawerOpen: false,
  setMobileDrawerOpen: () => {},
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const DashboardNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const openDrawer = () => setMobileDrawerOpen(true);
  const closeDrawer = () => setMobileDrawerOpen(false);

  return (
    <DashboardNavContext.Provider
      value={{
        mobileDrawerOpen,
        setMobileDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </DashboardNavContext.Provider>
  );
};

export const useDashboardNav = () => useContext(DashboardNavContext);
