/**
 * LOGO COMPONENT - Component hiển thị logo của 360edu
 * 
 * Được sử dụng trong:
 * - Header.jsx (trong navigation)
 * - Login.jsx (trong form header)
 * - Register.jsx (trong form header)
 * 
 * Chức năng:
 * - Hiển thị logo từ /assets/images/logo.jpg
 * - Size cố định 8x8 (32px x 32px)
 * - Object-contain để giữ tỷ lệ ảnh
 * - Rounded corners
 */

export default function Logo() {
  return (
    <img
      src="/assets/images/logo.jpg"
      alt="360edu Logo"
      className="w-8 h-8 object-contain rounded-lg"
    />
  );
}