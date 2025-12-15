// components/common/PageTitle.jsx
import React from "react";

const PageTitle = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;
