/**
 * Component layout chung cho các trang "Chi tiết"
 * Giúp đồng nhất UI giữa các trang detail trong hệ thống
 */
import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BackButton } from "./BackButton";

/**
 * Header cho trang detail
 * @param {string} title - Tiêu đề trang
 * @param {string} subtitle - Mô tả phụ
 * @param {function} onBack - Hàm xử lý khi click nút quay lại
 * @param {React.ReactNode} actions - Các nút hành động bên phải
 * @param {object} status - { label, className, icon: IconComponent }
 * @param {React.ReactNode} extraBadges - Các badge bổ sung (ví dụ: "Đã kết thúc")
 * @param {React.ComponentType} icon - Icon component hiển thị bên cạnh title
 * @param {string} iconColor - Màu gradient cho icon (blue, green, purple, orange, red, indigo)
 */
export function DetailHeader({
  title,
  subtitle,
  onBack,
  actions,
  status,
  extraBadges,
  icon: Icon,
  iconColor = "blue",
}) {
  const iconColorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-200",
    purple: "from-purple-500 to-purple-600 shadow-purple-200",
    orange: "from-orange-500 to-orange-600 shadow-orange-200",
    red: "from-red-500 to-red-600 shadow-red-200",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200",
    amber: "from-amber-500 to-amber-600 shadow-amber-200",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-200",
    teal: "from-teal-500 to-teal-600 shadow-teal-200",
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Back button - inline with header */}
          {onBack && <BackButton onClick={onBack} showLabel={false} />}
          {Icon && (
            <div
              className={`p-3 bg-gradient-to-br ${
                iconColorClasses[iconColor] || iconColorClasses.blue
              } rounded-xl shadow-lg`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {status && (
                <Badge className={`${status.className} px-3 py-1`}>
                  {status.icon && (
                    <status.icon className="w-3.5 h-3.5 mr-1.5 inline-block" />
                  )}
                  {status.label}
                </Badge>
              )}
              {extraBadges}
            </div>
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * Card thông tin với tiêu đề
 * @param {string} title - Tiêu đề section
 * @param {string} description - Mô tả thêm
 * @param {React.ReactNode} children - Nội dung
 * @param {React.ReactNode} headerActions - Actions ở header
 * @param {string} className - Class bổ sung
 */
export function DetailSection({
  title,
  description,
  children,
  headerActions,
  className = "",
  icon: Icon,
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-base font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                )}
              </div>
            </div>
            {headerActions && <div>{headerActions}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

/**
 * Hiển thị một trường thông tin với label và value
 * @param {string} label - Nhãn
 * @param {React.ReactNode} value - Giá trị
 * @param {React.ReactNode} icon - Icon (optional)
 * @param {string} className - Class bổ sung
 * @param {boolean} isHtml - Nếu true, render value như HTML (dùng cho rich text content)
 */
export function DetailField({
  label,
  value,
  icon: Icon,
  className = "",
  isHtml = false,
}) {
  const displayValue = value ?? "—";
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <div className={`${className}`}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </dt>
      {isHtml && !isEmpty ? (
        <dd
          className="text-sm font-medium text-gray-900 rich-text-content"
          dangerouslySetInnerHTML={{ __html: displayValue }}
        />
      ) : (
        <dd
          className={`text-sm font-medium ${
            isEmpty ? "text-gray-400" : "text-gray-900"
          }`}
        >
          {displayValue}
        </dd>
      )}
    </div>
  );
}

/**
 * Grid hiển thị nhiều trường thông tin
 * @param {number} cols - Số cột (default: 2)
 * @param {React.ReactNode} children - Các DetailField
 */
export function DetailFieldGrid({ cols = 2, children, className = "" }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <dl className={`grid ${gridCols[cols] || gridCols[2]} gap-6 ${className}`}>
      {children}
    </dl>
  );
}

/**
 * Card highlight thông tin quan trọng
 */
export function DetailHighlightCard({
  icon: Icon,
  label,
  value,
  description,
  colorScheme = "blue", // blue, green, purple, orange, red
  className = "",
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    green: "bg-emerald-50 border-emerald-100 text-emerald-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    red: "bg-red-50 border-red-100 text-red-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
  };

  const iconBgColors = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    indigo: "bg-indigo-100",
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border ${colors[colorScheme]} ${className}`}
    >
      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl ${iconBgColors[colorScheme]} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium opacity-80">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {description && (
          <p className="text-xs opacity-70 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Banner thông báo trạng thái
 */
export function DetailStatusBanner({
  icon: Icon,
  title,
  description,
  type = "info", // info, warning, success, error
  actions,
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const iconBgStyles = {
    info: "bg-blue-100",
    warning: "bg-amber-100",
    success: "bg-emerald-100",
    error: "bg-red-100",
  };

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border ${styles[type]}`}
    >
      {Icon && (
        <div
          className={`w-10 h-10 rounded-full ${iconBgStyles[type]} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-sm opacity-90 mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}

/**
 * Timeline item cho hiển thị lịch sử
 */
export function DetailTimeline({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                item.active ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
            {index < items.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500">
              {item.value || "Chưa có thông tin"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Wrapper cho toàn bộ trang detail
 */
export function DetailPageWrapper({ children, className = "" }) {
  return <div className={`p-6 space-y-6 ${className}`}>{children}</div>;
}

/**
 * Loading state cho trang detail
 */
export function DetailLoading({ message = "Đang tải..." }) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

/**
 * Error state cho trang detail
 */
export function DetailError({ message, onBack, onRetry }) {
  return (
    <div className="p-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-2">
          Có lỗi xảy ra
        </p>
        <p className="text-gray-500 mb-6 max-w-md">{message}</p>
        <div className="flex gap-3">
          {onBack && (
            <BackButton onClick={onBack} variant="outline" className="ml-0" />
          )}
          {onRetry && <Button onClick={onRetry}>Thử lại</Button>}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state cho trang detail
 */
export function DetailEmpty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <p className="text-lg font-medium text-gray-900 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
