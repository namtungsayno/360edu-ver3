import React from "react";

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

/**
 * Cách dùng:
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Tên</TableHead>
 *       <TableHead>Email</TableHead>
 *       ...
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Nguyễn Văn A</TableCell>
 *       <TableCell>...</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

export function Table({ className = "", children, ...props }) {
  return (
    <div
      className={cn("relative w-full overflow-x-auto", className)}
      {...props}
    >
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead
      className={cn("[&_tr]:border-b [&_tr]:border-gray-200", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = "",
  children,
  align = "left",
  ...props
}) {
  const alignCls =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";
  return (
    <th
      className={cn(
        "h-11 px-4 align-middle font-medium text-gray-600",
        "bg-gray-50",
        alignCls,
        className
      )}
      scope="col"
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = "",
  children,
  align = "left",
  ...props
}) {
  const alignCls =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";
  return (
    <td
      className={cn("p-4 align-middle text-gray-900", alignCls, className)}
      {...props}
    >
      {children}
    </td>
  );
}

export default {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
