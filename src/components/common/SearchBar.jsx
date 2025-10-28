// src/components/common/SearchBar.jsx
import { Search } from "lucide-react";
import { Input } from "../ui/Input";

export function SearchBar({ 
  placeholder = "Tìm kiếm...", 
  value, 
  onChange, 
  className = "" 
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-4 h-12 bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm"
      />
    </div>
  );
}
