/**
 * RICH TEXT EDITOR COMPONENT
 *
 * Component soạn thảo văn bản sử dụng Quill Editor
 * Hỗ trợ các tính năng: bold, italic, underline, list, link, image, ...
 *
 * Cách sử dụng:
 * import RichTextEditor from "@/components/ui/RichTextEditor";
 *
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Nhập nội dung..."
 * />
 */

import { useMemo, useRef, forwardRef } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Các định dạng được hỗ trợ (phù hợp với Quill)
// Lưu ý:
// - 'bullet' là một tuỳ chọn của toolbar cho 'list', KHÔNG phải format độc lập
// - 'clean' là hành động của toolbar, KHÔNG phải format
// - Thêm 'script' và 'direction' vì toolbar có sử dụng
const FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
  "direction",
  "script",
];

// Component RichTextEditor
const RichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Nhập nội dung...",
      className = "",
      readOnly = false,
      theme = "snow",
      minHeight = "200px",
      maxHeight = "500px",
      simple = false, // Chế độ đơn giản (ít toolbar hơn)
      ...props
    },
    ref
  ) => {
    const quillRef = useRef(null);

    // Cấu hình toolbar đầy đủ
    const fullModules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        clipboard: {
          matchVisual: false,
        },
      }),
      []
    );

    // Cấu hình toolbar đơn giản
    const simpleModules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
        clipboard: {
          matchVisual: false,
        },
      }),
      []
    );

    const modules = simple ? simpleModules : fullModules;

    // Xử lý onChange
    const handleChange = (content) => {
      if (onChange) {
        onChange(content);
      }
    };

    return (
      <div
        className={`rich-text-editor ${className}`}
        style={{
          "--editor-min-height": minHeight,
          "--editor-max-height": maxHeight,
        }}
      >
        <ReactQuill
          ref={(el) => {
            quillRef.current = el;
            if (ref) {
              if (typeof ref === "function") {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          theme={theme}
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
          readOnly={readOnly}
          {...props}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
  theme: PropTypes.string,
  minHeight: PropTypes.string,
  maxHeight: PropTypes.string,
  simple: PropTypes.bool,
};

export default RichTextEditor;

// Export thêm component hiển thị nội dung HTML
export function RichTextContent({ content, className = "" }) {
  return (
    <div
      className={`rich-text-content prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

RichTextContent.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
};
