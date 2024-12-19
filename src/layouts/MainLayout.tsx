import { Theme } from '@radix-ui/themes';
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Theme appearance="dark" grayColor="sand" radius="large" scaling="95%">
      <div className="app-layout">
        {children}
      </div>
    </Theme>
  );
};

export default MainLayout; 