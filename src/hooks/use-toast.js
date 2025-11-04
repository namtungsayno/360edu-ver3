export function useToast() {
  const success = (msg) => {
    console.log("✅", msg);
    alert(msg);
  };

  const error = (msg) => {
    console.error("❌", msg);
    alert(msg);
  };

  const info = (msg) => {
    console.log("ℹ️", msg);
    alert(msg);
  };

  return { success, error, info };
}

// ✅ Thêm export này nếu bạn muốn import { toast } trực tiếp
export const toast = {
  success: (msg) => alert("✅ " + msg),
  error: (msg) => alert("❌ " + msg),
  info: (msg) => alert("ℹ️ " + msg),
};
