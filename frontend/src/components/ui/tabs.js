import React, { useState } from 'react';

export const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.title);

  return (
    <div>
      <div className="tab-buttons">
        {children.map(tab => (
          <button
            key={tab.props.title}
            onClick={() => setActiveTab(tab.props.title)}
            className={activeTab === tab.props.title ? 'active' : ''}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {children.find(tab => tab.props.title === activeTab)}
      </div>
    </div>
  );
};

export const Tab = ({ title, children }) => {
  return <div>{children}</div>;
};