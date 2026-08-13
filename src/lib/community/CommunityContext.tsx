import React, { createContext, useContext, ReactNode } from 'react';
import { useCommunity } from './useCommunity';

type CommunityContextValue = ReturnType<typeof useCommunity>;

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const value = useCommunity();
  return (
    <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
  );
}

export function useCommunityContext() {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error('useCommunityContext must be used within CommunityProvider');
  }
  return ctx;
}
