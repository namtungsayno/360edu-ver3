/**
 * HOME PAGE - Trang chủ của website
 * 
 * Route: /home
 * Layout: GuestLayout
 * 
 * Components:
 * - Banner: Banner chính với CTA buttons
 * - Footer: Footer thông tin liên hệ
 * 
 * Chức năng:
 * - Trang landing đầu tiên khi user vào website
 * - Giới thiệu về 360edu và các hình thức học tập
 * - Điều hướng đến các trang con (lớp học, khóa học)
 */

import { useOutletContext } from "react-router-dom";
import Banner from "../../components/common/Banner";
import { Footer } from "../../components/common/Footer";

export default function Home() {
  // Nhận onNavigate function từ GuestLayout qua context
  const { onNavigate } = useOutletContext();

  return (
    <>
      {/* Banner - Phần banner chính */}
      <Banner onNavigate={onNavigate} />
      
      {/* Footer - Thông tin liên hệ */}
      <Footer />
    </>
  );
}