import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../context/AuthContext";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { CalendarDays, Clock } from "lucide-react";

export default function Schedule() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Placeholder: integrate student schedule API here
    setLoading(true);
    setTimeout(() => {
      setItems([]);
      setLoading(false);
    }, 200);
  }, []);

  return (
    <section className="py-10">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Lịch học của tôi</h1>
        </div>

        {!user && (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700">Vui lòng đăng nhập để xem lịch học.</p>
            </CardContent>
          </Card>
        )}

        {user && (
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <p className="text-gray-600">Đang tải lịch học...</p>
              ) : items.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Chưa có lịch học trong tuần này.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{it.className}</p>
                        <p className="text-sm text-gray-600">Thứ {it.dayOfWeek} • {it.startTime} - {it.endTime}</p>
                      </div>
                      <Button size="sm">Vào lớp</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
