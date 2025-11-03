/**
 * TABS COMPONENTS - Components để tạo tabs navigation
 * 
 * Chức năng:
 * - Tabs: Container chính cho tabs
 * - TabsList: Danh sách các tab
 * - TabsTrigger: Button để chuyển tab
 * - TabsContent: Nội dung của mỗi tab
 */

import { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export function Tabs({ defaultValue, className = "", children, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      className={`inline-flex h-9 w-fit items-center justify-center rounded-xl bg-green-50 p-[3px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white text-green-700 shadow-sm border-green-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-green-100/50"
      } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;

  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
