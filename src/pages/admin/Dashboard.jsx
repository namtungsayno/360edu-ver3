// pages/admin/Dashboard.jsx
import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  Calendar,
} from "lucide-react";

/** --------- LightCard: khung trắng chuẩn light --------- */
function LightCard({ title, children, right }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {(title || right) && (
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/** ---------- Mini SVG charts (no libs) ---------- */
function LineChartSVG({ data, xKey, yKey }) {
  const W = 720,
    H = 240,
    P = 32;
  const xs = data.map((d) => d[xKey]);
  const ys = data.map((d) => d[yKey]);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const x = (i) => P + (i * (W - 2 * P)) / (data.length - 1 || 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min || 1);
  const path = data
    .map((d, i) => `${i ? "L" : "M"} ${x(i)},${y(d[yKey])}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
      {/* grid */}
      <g stroke="#eef2f7">
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={P}
            x2={W - P}
            y1={P + i * ((H - 2 * P) / 3)}
            y2={P + i * ((H - 2 * P) / 3)}
          />
        ))}
      </g>
      {/* axes */}
      <g stroke="#e5e7eb">
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} />
        <line x1={P} y1={P} x2={P} y2={H - P} />
      </g>
      {/* x labels */}
      <g fontSize="12" fill="#64748b">
        {xs.map((t, i) => (
          <text key={t} x={x(i)} y={H - P + 18} textAnchor="middle">
            {t}
          </text>
        ))}
      </g>
      {/* line + dots */}
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth="3" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d[yKey])} r="3" fill="#4f46e5" />
      ))}
    </svg>
  );
}

function PieChartSVG({ data, colors }) {
  const W = 360,
    H = 240,
    R = 80,
    CX = W / 2,
    CY = H / 2;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let start = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = CX + R * Math.cos(start);
    const y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end);
    const y2 = CY + R * Math.sin(end);
    const path = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
    const mid = start + angle / 2;
    const lx = CX + (R + 18) * Math.cos(mid);
    const ly = CY + (R + 18) * Math.sin(mid);
    start = end;
    return {
      path,
      color: colors[i % colors.length],
      label: `${d.name}: ${Math.round((d.value / total) * 100)}%`,
      lx,
      ly,
    };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.color} />
      ))}
      <g fontSize="12" fill="#64748b">
        {arcs.map((a, i) => (
          <text key={i} x={a.lx} y={a.ly} textAnchor="middle">
            {a.label}
          </text>
        ))}
      </g>
    </svg>
  );
}

function BarChartSVG({ data, keys, colors }) {
  const W = 720,
    H = 300,
    P = 40;
  const groupW = (W - 2 * P) / data.length;
  const barGap = 6;
  const barW = (groupW - (keys.length - 1) * barGap) / keys.length;

  const max = Math.max(
    10,
    ...data.map((d) => keys.reduce((m, k) => Math.max(m, d[k] || 0), 0))
  );
  const y = (v) => H - P - (v * (H - 2 * P)) / max;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-72">
      {/* grid */}
      <g stroke="#eef2f7">
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = P + i * ((H - 2 * P) / 4);
          return <line key={i} x1={P} x2={W - P} y1={yy} y2={yy} />;
        })}
      </g>
      {/* axes */}
      <g stroke="#e5e7eb">
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} />
        <line x1={P} y1={P} x2={P} y2={H - P} />
      </g>
      {/* bars */}
      {data.map((d, i) => {
        const gx = P + i * groupW;
        return keys.map((k, idx) => {
          const val = d[k] || 0;
          const x = gx + idx * (barW + barGap);
          const yTop = y(val);
          const h = H - P - yTop;
          return (
            <rect
              key={`${i}-${k}`}
              x={x}
              y={yTop}
              width={barW}
              height={h}
              rx="6"
              fill={colors[idx % colors.length]}
            />
          );
        });
      })}
      {/* x labels */}
      <g fontSize="12" fill="#64748b">
        {data.map((d, i) => (
          <text
            key={i}
            x={P + i * groupW + groupW / 2}
            y={H - P + 18}
            textAnchor="middle"
          >
            {d.month}
          </text>
        ))}
      </g>
      {/* legend */}
      <g fontSize="12">
        {keys.map((k, i) => (
          <g key={k} transform={`translate(${P + i * 120}, ${P - 14})`}>
            <rect
              width="12"
              height="12"
              rx="2"
              fill={colors[i % colors.length]}
            />
            <text x="18" y="11" fill="#475569">
              {k}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** ---------- Page (Light) ---------- */
export default function Dashboard() {
  // mock data (có thể thay bằng API)
  const growthData = [
    { month: "T1", students: 185 },
    { month: "T2", students: 205 },
    { month: "T3", students: 230 },
    { month: "T4", students: 260 },
    { month: "T5", students: 275 },
    { month: "T6", students: 320 },
  ];

  const distributionData = [
    { name: "Online", value: 45 },
    { name: "Offline", value: 38 },
    { name: "Video", value: 17 },
  ];
  const PIE_COLORS = ["#4f46e5", "#22c55e", "#f59e0b"];

  const revenueData = [
    { month: "T1", Online: 42, Offline: 75, Video: 24 },
    { month: "T2", Online: 53, Offline: 82, Video: 29 },
    { month: "T3", Online: 60, Offline: 91, Video: 31 },
    { month: "T4", Online: 68, Offline: 96, Video: 36 },
    { month: "T5", Online: 74, Offline: 102, Video: 41 },
    { month: "T6", Online: 81, Offline: 112, Video: 47 },
  ];
  const BAR_KEYS = ["Online", "Offline", "Video"];
  const BAR_COLORS = ["#4f46e5", "#22c55e", "#f59e0b"];

  const todaySchedules = useMemo(
    () => [
      {
        id: 1,
        title: "Toán 10A1",
        teacher: "Nguyễn Văn X",
        time: "14:00",
        room: "P201",
      },
      {
        id: 2,
        title: "Lý 11B2",
        teacher: "Trần Thị Y",
        time: "15:30",
        room: "P305",
      },
      {
        id: 3,
        title: "Hoá 12C3",
        teacher: "Lê Văn Z",
        time: "16:00",
        room: "Online",
      },
      {
        id: 4,
        title: "Anh 9A",
        teacher: "Phạm Thị K",
        time: "17:00",
        room: "P102",
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header với gradient */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
          <LayoutDashboard className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.
          </p>
        </div>
      </div>

      {/* Stats với gradient cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng số học viên */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Tổng số học viên
              </p>
              <p className="text-3xl font-bold mt-1">1,234</p>
              <p className="text-xs text-blue-100 mt-2">
                ▲ +12.5% so với tháng trước
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Giáo viên */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-violet-100 text-sm font-medium">Giáo viên</p>
              <p className="text-3xl font-bold mt-1">89</p>
              <p className="text-xs text-violet-100 mt-2">
                ▲ +3.2% so với tháng trước
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Lớp học hoạt động */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-cyan-100 text-sm font-medium">
                Lớp học hoạt động
              </p>
              <p className="text-3xl font-bold mt-1">156</p>
              <p className="text-xs text-cyan-100 mt-2">
                ▲ +8.1% so với tháng trước
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Doanh thu tháng */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-emerald-100 text-sm font-medium">
                Doanh thu tháng
              </p>
              <p className="text-3xl font-bold mt-1">₫245.5M</p>
              <p className="text-xs text-emerald-100 mt-2">
                ▲ +15.3% so với tháng trước
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LightCard title="Tăng trưởng học viên">
          <LineChartSVG data={growthData} xKey="month" yKey="students" />
        </LightCard>

        <LightCard title="Phân bổ khoá học">
          <PieChartSVG data={distributionData} colors={PIE_COLORS} />
        </LightCard>

        <LightCard title="Lịch học hôm nay">
          <ul className="divide-y divide-gray-100">
            {todaySchedules.map((it) => (
              <li
                key={it.id}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{it.title}</p>
                    <p className="text-sm text-gray-500">{it.teacher}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 text-sm font-medium">{it.time}</p>
                  <p className="text-xs text-gray-500">{it.room}</p>
                </div>
              </li>
            ))}
          </ul>
        </LightCard>
      </div>

      {/* Charts row 2 */}
      <LightCard title="Doanh thu theo loại khoá học (triệu VND)">
        <BarChartSVG
          data={revenueData}
          keys={["Online", "Offline", "Video"]}
          colors={["#4f46e5", "#22c55e", "#f59e0b"]}
        />
      </LightCard>
    </div>
  );
}
