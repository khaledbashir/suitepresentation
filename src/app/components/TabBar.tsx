import { useState } from 'react';

type ViewMode = 'editor' | 'preview' | 'sandbox';

interface TabBarProps {
  onTabChange: (tab: ViewMode) => void;
}

const TabBar = ({ onTabChange }: TabBarProps) => {
  const [activeTab, setActiveTab] = useState<ViewMode>('sandbox');

  const handleTabClick = (tab: ViewMode) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <div className="tab-bar">
      <button 
        className={`tab ${activeTab === 'sandbox' ? 'active' : ''}`}
        onClick={() => handleTabClick('sandbox')}
      >
        🚀 Sandbox
      </button>
      <button 
        className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
        onClick={() => handleTabClick('editor')}
      >
        📝 Editor
      </button>
      <button 
        className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
        onClick={() => handleTabClick('preview')}
      >
        👁️ Preview
      </button>
    </div>
  );
};

export default TabBar;
