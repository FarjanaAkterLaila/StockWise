import React, { useState } from 'react';
import type { NavModule } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import {
  LayoutWrapper,
  MainContentArea,
  ScrollableContent,
  PageContainer,
} from './AppLayout.styles';

interface AppLayoutProps {
  children: React.ReactNode;
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  onQuickSale?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeModule,
  onSelectModule,
  onQuickSale,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <LayoutWrapper>
      <Sidebar
        activeModule={activeModule}
        onSelectModule={onSelectModule}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <MainContentArea>
        <Header
          activeModule={activeModule}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenQuickSale={onQuickSale}
        />

        <ScrollableContent>
          <PageContainer>
            {children}
          </PageContainer>
        </ScrollableContent>
      </MainContentArea>
    </LayoutWrapper>
  );
};
