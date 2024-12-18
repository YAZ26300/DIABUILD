interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  activeTab: string;
}

const TabPanel = ({ children, value, activeTab }: TabPanelProps) => {
  return (
    <div role="tabpanel" hidden={value !== activeTab} className="tab-panel">
      {value === activeTab && children}
    </div>
  );
};

export default TabPanel; 