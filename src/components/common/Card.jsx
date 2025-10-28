//E:\Semester9\360Edu\src\components\common\Card.jsx NgocHung
export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
