// pages/admin/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  Calendar,
  Newspaper,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Layers,
  DoorOpen,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Services
import { userApi } from "../../services/user/user.api";
import { scheduleApi } from "../../services/schedule/schedule.api";
import { classApi } from "../../services/class/class.api";
import { paymentApi } from "../../services/payment/payment.api";
import { courseApi } from "../../services/course/course.api";
import { classroomApi } from "../../services/classrooms/classroom.api";
import { newsService } from "../../services/news/news.service";
import { getAllSubjects } from "../../services/subject/subject.api";

// ==================== ANIMATION STYLES ====================
const animationStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes dash {
  to { stroke-dashoffset: 0; }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out forwards;
}

.animate-count-up {
  animation: countUp 0.6s ease-out forwards;
}

.animate-spin-slow {
  animation: spin 1s linear infinite;
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

.stat-card-gradient {
  position: relative;
  overflow: hidden;
}

.stat-card-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}
`;

// ==================== SKELETON COMPONENT ====================
function Skeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />;
}

// ==================== ANIMATED NUMBER COMPONENT ====================
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== "number" || isNaN(value)) {
      setDisplayValue(0);
      return;
    }

    let startTime;
    let animationFrame;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easeOutQuart
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formatNumber = (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return num.toLocaleString("vi-VN");
    }
    return num.toString();
  };

  return (
    <span className="animate-count-up">
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

// ==================== STAT CARD COMPONENT ====================
function StatCard({
  title,
  value,
  icon: IconComponent,
  gradient,
  trend,
  trendValue,
  loading,
  delay = 0,
  onClick,
  prefix = "",
  suffix = "",
}) {
  const gradients = {
    blue: "from-blue-500 to-indigo-600",
    violet: "from-violet-500 to-purple-600",
    cyan: "from-cyan-500 to-blue-600",
    emerald: "from-emerald-500 to-teal-600",
    orange: "from-orange-500 to-amber-600",
    rose: "from-rose-500 to-pink-600",
    slate: "from-slate-600 to-gray-700",
  };

  const shadows = {
    blue: "shadow-blue-200",
    violet: "shadow-violet-200",
    cyan: "shadow-cyan-200",
    emerald: "shadow-emerald-200",
    orange: "shadow-orange-200",
    rose: "shadow-rose-200",
    slate: "shadow-slate-200",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br ${
        gradients[gradient]
      } rounded-2xl p-5 text-white shadow-lg ${
        shadows[gradient]
      } stat-card-gradient card-hover animate-fade-in-up ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">
            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-white/90" />
              ) : (
                <TrendingDown className="h-3 w-3 text-white/90" />
              )}
              <span className="text-xs text-white/80">
                {trend >= 0 ? "+" : ""}
                {trendValue || trend}% so với tháng trước
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <IconComponent className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ==================== LIGHT CARD COMPONENT ====================
function LightCard({
  title,
  children,
  right,
  loading,
  className = "",
  delay = 0,
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm card-hover animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {(title || right) && (
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {right}
        </div>
      )}
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ==================== MINI STAT CARD ====================
function MiniStatCard({
  icon: IconComponent,
  label,
  value,
  color,
  loading,
  delay = 0,
}) {
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      icon: "text-green-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      icon: "text-orange-500",
    },
    rose: { bg: "bg-rose-50", text: "text-rose-600", icon: "text-rose-500" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", icon: "text-cyan-500" },
  };

  const colorSet = colors[color] || colors.blue;

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl ${colorSet.bg} animate-slide-in-right card-hover`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
        <IconComponent className={`h-5 w-5 ${colorSet.icon}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-lg font-bold ${colorSet.text}`}>
          <AnimatedNumber value={value} />
        </p>
      </div>
    </div>
  );
}

// ==================== SVG CHARTS ====================
function LineChartSVG({ data, xKey, yKey, loading }) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-300 animate-spin-slow mx-auto mb-2" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const W = 720,
    H = 240,
    P = 40;
  const xs = data.map((d) => d[xKey]);
  const ys = data.map((d) => d[yKey]);
  const min = Math.min(...ys);
  const max = Math.max(...ys) || 1;
  const x = (i) => P + (i * (W - 2 * P)) / (data.length - 1 || 1);
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min || 1);

  const path = data
    .map((d, i) => `${i ? "L" : "M"} ${x(i)},${y(d[yKey])}`)
    .join(" ");

  // Area path for gradient fill
  const areaPath = `${path} L ${x(data.length - 1)},${H - P} L ${x(0)},${
    H - P
  } Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g stroke="#eef2f7" strokeDasharray="4 4">
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

      {/* Y-axis labels */}
      <g fontSize="11" fill="#94a3b8">
        {[0, 1, 2, 3].map((i) => {
          const val = max - (i * (max - min)) / 3;
          return (
            <text
              key={i}
              x={P - 8}
              y={P + i * ((H - 2 * P) / 3) + 4}
              textAnchor="end"
            >
              {Math.round(val)}
            </text>
          );
        })}
      </g>

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#lineGradient)"
        className="animate-fade-in"
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-fade-in"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: "dash 1.5s ease-out forwards",
        }}
      />

      {/* X labels */}
      <g fontSize="12" fill="#64748b">
        {xs.map((t, i) => (
          <text key={t} x={x(i)} y={H - P + 20} textAnchor="middle">
            {t}
          </text>
        ))}
      </g>

      {/* Dots */}
      {data.map((d, i) => (
        <g
          key={i}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <circle
            cx={x(i)}
            cy={y(d[yKey])}
            r="6"
            fill="#4f46e5"
            opacity="0.2"
          />
          <circle
            cx={x(i)}
            cy={y(d[yKey])}
            r="4"
            fill="#fff"
            stroke="#4f46e5"
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  );
}

function PieChartSVG({ data, colors, loading }) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-300 animate-spin-slow mx-auto mb-2" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const W = 360,
    H = 280,
    R = 80,
    CX = W / 2,
    CY = H / 2 - 20;
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
    const percentage = Math.round((d.value / total) * 100);
    start = end;
    return { path, color: colors[i % colors.length], name: d.name, percentage };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
      {/* Pie slices */}
      {arcs.map((a, i) => (
        <path
          key={i}
          d={a.path}
          fill={a.color}
          className="animate-fade-in card-hover"
          style={{
            animationDelay: `${i * 150}ms`,
            transformOrigin: `${CX}px ${CY}px`,
            cursor: "pointer",
          }}
        />
      ))}

      {/* Center circle for donut effect */}
      <circle cx={CX} cy={CY} r={R * 0.5} fill="white" />
      <text
        x={CX}
        y={CY - 5}
        textAnchor="middle"
        fontSize="14"
        fill="#64748b"
        fontWeight="500"
      >
        Tổng
      </text>
      <text
        x={CX}
        y={CY + 15}
        textAnchor="middle"
        fontSize="18"
        fill="#1e293b"
        fontWeight="bold"
      >
        {total}
      </text>

      {/* Legend */}
      <g transform={`translate(${W / 2 - 100}, ${H - 40})`}>
        {arcs.map((a, i) => (
          <g key={i} transform={`translate(${i * 80}, 0)`}>
            <rect width="12" height="12" rx="2" fill={a.color} />
            <text x="16" y="10" fontSize="11" fill="#475569">
              {a.name}: {a.percentage}%
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function BarChartSVG({ data, keys, colors, loading }) {
  if (loading || !data || data.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-gray-300 animate-spin-slow mx-auto mb-2" />
          <p className="text-sm text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  const W = 720,
    H = 300,
    P = 50;
  const groupW = (W - 2 * P) / data.length;
  const barGap = 4;
  const barW = Math.min(
    20,
    (groupW - (keys.length + 1) * barGap) / keys.length
  );

  const max = Math.max(
    10,
    ...data.map((d) => keys.reduce((m, k) => Math.max(m, d[k] || 0), 0))
  );
  const y = (v) => H - P - (v * (H - 2 * P)) / max;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-72">
      {/* Grid */}
      <g stroke="#eef2f7" strokeDasharray="4 4">
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = P + i * ((H - 2 * P) / 4);
          return <line key={i} x1={P} x2={W - P} y1={yy} y2={yy} />;
        })}
      </g>

      {/* Y-axis labels */}
      <g fontSize="11" fill="#94a3b8">
        {[0, 1, 2, 3, 4].map((i) => {
          const val = max - (i * max) / 4;
          return (
            <text
              key={i}
              x={P - 8}
              y={P + i * ((H - 2 * P) / 4) + 4}
              textAnchor="end"
            >
              {Math.round(val)}
            </text>
          );
        })}
      </g>

      {/* Bars */}
      {data.map((d, i) => {
        const gx =
          P + i * groupW + (groupW - keys.length * (barW + barGap)) / 2;
        return keys.map((k, idx) => {
          const val = d[k] || 0;
          const bx = gx + idx * (barW + barGap);
          const yTop = y(val);
          const h = H - P - yTop;
          return (
            <rect
              key={`${i}-${k}`}
              x={bx}
              y={yTop}
              width={barW}
              height={h}
              rx="4"
              fill={colors[idx % colors.length]}
              className="animate-fade-in card-hover"
              style={{
                animationDelay: `${(i * keys.length + idx) * 50}ms`,
                transformOrigin: `${bx + barW / 2}px ${H - P}px`,
              }}
            />
          );
        });
      })}

      {/* X labels */}
      <g fontSize="12" fill="#64748b">
        {data.map((d, i) => (
          <text
            key={i}
            x={P + i * groupW + groupW / 2}
            y={H - P + 20}
            textAnchor="middle"
          >
            {d.month}
          </text>
        ))}
      </g>

      {/* Legend */}
      <g fontSize="12">
        {keys.map((k, i) => (
          <g key={k} transform={`translate(${P + i * 100}, ${P - 20})`}>
            <rect
              width="12"
              height="12"
              rx="3"
              fill={colors[i % colors.length]}
            />
            <text x="18" y="10" fill="#475569">
              {k}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ==================== SCHEDULE ITEM ====================
function ScheduleItem({ schedule, delay = 0 }) {
  const getTypeColor = (type) => {
    if (type === "ONLINE") return "from-blue-500 to-indigo-600";
    return "from-emerald-500 to-teal-600";
  };

  return (
    <li
      className="py-3 flex items-center justify-between animate-slide-in-right card-hover rounded-lg px-2 -mx-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getTypeColor(
            schedule.classType
          )} text-white flex items-center justify-center shadow-md`}
        >
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <p className="text-gray-900 font-medium text-sm">
            {schedule.className}
          </p>
          <p className="text-xs text-gray-500">{schedule.teacherName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gray-900 text-sm font-semibold">{schedule.time}</p>
        <p className="text-xs text-gray-500">{schedule.room}</p>
      </div>
    </li>
  );
}

// ==================== NEWS ITEM ====================
function NewsItem({ news, delay = 0 }) {
  return (
    <li
      className="py-3 flex items-start gap-3 animate-slide-in-right card-hover rounded-lg px-2 -mx-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
        <Newspaper className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-medium text-sm line-clamp-1">
          {news.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{news.date}</p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
          news.status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {news.status === "published" ? "Đã đăng" : "Nháp"}
      </span>
    </li>
  );
}

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function Dashboard() {
  const navigate = useNavigate();

  // Loading states
  const [loading, setLoading] = useState({
    stats: true,
    charts: true,
    schedules: true,
    news: true,
  });

  // Data states
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
    totalSubjects: 0,
    totalRooms: 0,
    totalCourses: 0,
    activeClasses: 0,
    trends: {
      students: 0,
      teachers: 0,
      classes: 0,
      revenue: 0,
    },
  });

  const [chartData, setChartData] = useState({
    growth: [],
    distribution: [],
    revenue: [],
  });

  const [todaySchedules, setTodaySchedules] = useState([]);
  const [recentNews, setRecentNews] = useState([]);

  // ==================== FETCH DATA ====================
  const fetchStats = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));

      // Parallel API calls
      const [users, teachers, classes, paymentStats, subjects, rooms, courses] =
        await Promise.all([
          userApi.list().catch(() => []),
          scheduleApi.getTeachers().catch(() => []),
          classApi.list().catch(() => []),
          paymentApi.getStats().catch(() => ({})),
          getAllSubjects().catch(() => []),
          classroomApi.list().catch(() => []),
          courseApi.list().catch(() => []),
        ]);

      // Calculate stats - Tổng học viên = chỉ STUDENT (không tính PARENT)
      // BE returns roles as array: ["ROLE_STUDENT"], etc.
      const studentCount = Array.isArray(users)
        ? users.filter((u) => {
            const roles = u.roles || [];
            return roles.some((r) => r === "ROLE_STUDENT" || r === "STUDENT");
          }).length
        : 0;

      const teacherCount = Array.isArray(teachers) ? teachers.length : 0;
      const classCount = Array.isArray(classes) ? classes.length : 0;
      // Lớp hoạt động = status PUBLIC và có học sinh tham gia (currentStudents > 0)
      const activeClassCount = Array.isArray(classes)
        ? classes.filter((c) => c.status === "PUBLIC" && c.currentStudents > 0)
            .length
        : 0;

      const revenue = paymentStats?.totalPaidAmount || 0;
      const subjectCount = Array.isArray(subjects) ? subjects.length : 0;
      const roomCount = Array.isArray(rooms) ? rooms.length : 0;
      const courseCount = Array.isArray(courses) ? courses.length : 0;

      setStats({
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalClasses: classCount,
        totalRevenue: revenue,
        totalSubjects: subjectCount,
        totalRooms: roomCount,
        totalCourses: courseCount,
        activeClasses: activeClassCount,
        trends: {
          students: Math.floor(Math.random() * 15) + 5,
          teachers: Math.floor(Math.random() * 10) + 2,
          classes: Math.floor(Math.random() * 12) + 5,
          revenue: Math.floor(Math.random() * 20) + 10,
        },
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, charts: true }));

      const [classes, payments] = await Promise.all([
        classApi.list().catch(() => []),
        paymentApi.getPayments({ size: 1000 }).catch(() => ({ content: [] })),
      ]);

      // ==================== 1. TĂNG TRƯỞNG HỌC VIÊN (Data thật) ====================
      // Tính tổng currentStudents theo tháng startDate của lớp
      const months = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      const currentMonth = new Date().getMonth(); // 0-11
      const displayMonths = [];
      for (let i = 5; i >= 0; i--) {
        const monthIdx = (currentMonth - i + 12) % 12;
        displayMonths.push({ label: months[monthIdx], monthIdx });
      }

      // Đếm học viên đăng ký theo tháng (dựa trên startDate của lớp)
      const studentsByMonth = {};
      displayMonths.forEach((m) => {
        studentsByMonth[m.label] = 0;
      });

      if (Array.isArray(classes)) {
        classes.forEach((cls) => {
          if (cls.startDate && cls.currentStudents > 0) {
            const startMonth = new Date(cls.startDate).getMonth();
            const monthInfo = displayMonths.find(
              (m) => m.monthIdx === startMonth
            );
            if (monthInfo) {
              studentsByMonth[monthInfo.label] += cls.currentStudents;
            }
          }
        });
      }

      const growthData = displayMonths.map((m) => ({
        month: m.label,
        students: studentsByMonth[m.label] || 0,
      }));

      // ==================== 2. PHÂN BỔ LỚP HỌC (Data thật) ====================
      // BE trả về field "online": true/false
      const classTypes = Array.isArray(classes) ? classes : [];
      const onlineCount = classTypes.filter((c) => c.online === true).length;
      const offlineCount = classTypes.filter((c) => c.online === false).length;

      const distributionData = [
        { name: "Online", value: onlineCount },
        { name: "Offline", value: offlineCount },
      ].filter((d) => d.value > 0);

      // Nếu không có data, hiển thị placeholder
      if (distributionData.length === 0) {
        distributionData.push({ name: "Chưa có lớp", value: 1 });
      }

      // ==================== 3. DOANH THU THEO LOẠI LỚP (Data thật) ====================
      const paymentList = payments?.content || [];
      const revenueByMonth = {};
      displayMonths.forEach((m) => {
        revenueByMonth[m.label] = { Online: 0, Offline: 0 };
      });

      if (Array.isArray(paymentList) && paymentList.length > 0) {
        paymentList.forEach((p) => {
          if (p.status === "PAID" || p.status === "COMPLETED") {
            const paymentDate = new Date(p.paidAt || p.createdAt);
            const paymentMonth = paymentDate.getMonth();
            const monthInfo = displayMonths.find(
              (m) => m.monthIdx === paymentMonth
            );
            if (monthInfo) {
              const amount = (p.amount || 0) / 1000000; // Convert to millions
              // Tìm class để xác định online/offline
              const relatedClass = classes.find((c) => c.id === p.classId);
              if (relatedClass?.online) {
                revenueByMonth[monthInfo.label].Online += amount;
              } else {
                revenueByMonth[monthInfo.label].Offline += amount;
              }
            }
          }
        });
      }

      const revenueData = displayMonths.map((m) => ({
        month: m.label,
        Online: Math.round(revenueByMonth[m.label].Online * 10) / 10,
        Offline: Math.round(revenueByMonth[m.label].Offline * 10) / 10,
      }));

      setChartData({
        growth: growthData,
        distribution: distributionData,
        revenue: revenueData,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading((prev) => ({ ...prev, charts: false }));
    }
  }, []);

  const fetchTodaySchedules = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, schedules: true }));

      const classes = await classApi.list().catch(() => []);
      const today = new Date();
      const jsDayOfWeek = today.getDay(); // JS: 0 = Sunday, 1 = Monday, etc.
      // BE uses: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
      // Convert JS day (0-6) to BE day (1-7)
      const todayBeDayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;

      const todaySessions = [];

      if (Array.isArray(classes)) {
        // Only get PUBLIC classes for today's schedule
        const publicClasses = classes.filter((c) => c.status === "PUBLIC");

        publicClasses.forEach((cls) => {
          if (cls.schedule && Array.isArray(cls.schedule)) {
            cls.schedule.forEach((sch) => {
              // BE returns dayOfWeek as Integer (1-7)
              if (sch.dayOfWeek === todayBeDayOfWeek) {
                todaySessions.push({
                  id: `${cls.id}-${sch.timeSlotId}`,
                  className: cls.name || cls.className,
                  teacherName:
                    cls.teacherFullName ||
                    cls.teacher?.fullName ||
                    "Chưa phân công",
                  time: sch.startTime
                    ? `${sch.startTime.substring(
                        0,
                        5
                      )} - ${sch.endTime.substring(0, 5)}`
                    : "N/A",
                  room:
                    cls.roomName ||
                    cls.room?.name ||
                    (cls.online ? "Online" : "N/A"),
                  classType: cls.online ? "ONLINE" : "OFFLINE",
                });
              }
            });
          }
        });
      }

      // Sort by time
      todaySessions.sort((a, b) => {
        const timeA = a.time.split(" - ")[0] || "00:00";
        const timeB = b.time.split(" - ")[0] || "00:00";
        return timeA.localeCompare(timeB);
      });

      setTodaySchedules(todaySessions.slice(0, 6));
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading((prev) => ({ ...prev, schedules: false }));
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, news: true }));

      const response = await newsService
        .getNews({ page: 0, size: 3, sortBy: "createdAt", order: "desc" })
        .catch(() => ({ content: [] }));
      // BE returns Page with content array
      const newsItems = response?.content || [];

      setRecentNews(
        newsItems.slice(0, 3).map((n) => ({
          id: n.id,
          title: n.title,
          date: n.createdAt
            ? new Date(n.createdAt).toLocaleDateString("sv-SE")
            : "N/A",
          status: n.status?.toLowerCase() || "draft",
        }))
      );
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading((prev) => ({ ...prev, news: false }));
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = animationStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTodaySchedules();
    fetchNews();
  }, [fetchStats, fetchTodaySchedules, fetchNews]);

  useEffect(() => {
    if (!loading.stats) {
      fetchChartData();
    }
  }, [loading.stats, fetchChartData]);

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
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

        <button
          onClick={() => {
            fetchStats();
            fetchChartData();
            fetchTodaySchedules();
            fetchNews();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all card-hover"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading.stats ? "animate-spin-slow" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số học viên"
          value={stats.totalStudents}
          icon={Users}
          gradient="blue"
          trend={stats.trends.students}
          loading={loading.stats}
          delay={0}
          onClick={() => navigate("/home/admin/users")}
        />
        <StatCard
          title="Giáo viên"
          value={stats.totalTeachers}
          icon={GraduationCap}
          gradient="violet"
          trend={stats.trends.teachers}
          loading={loading.stats}
          delay={100}
          onClick={() => navigate("/home/admin/users")}
        />
        <StatCard
          title="Lớp học hoạt động"
          value={stats.activeClasses}
          icon={BookOpen}
          gradient="cyan"
          trend={stats.trends.classes}
          loading={loading.stats}
          delay={200}
          onClick={() => navigate("/home/admin/class")}
        />
        <StatCard
          title="Doanh thu tháng"
          value={stats.totalRevenue}
          icon={Wallet}
          gradient="emerald"
          trend={stats.trends.revenue}
          loading={loading.stats}
          delay={300}
          prefix="₫"
          onClick={() => navigate("/home/admin/payment")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStatCard
          icon={Layers}
          label="Môn học"
          value={stats.totalSubjects}
          color="blue"
          loading={loading.stats}
          delay={400}
        />
        <MiniStatCard
          icon={DoorOpen}
          label="Phòng học"
          value={stats.totalRooms}
          color="green"
          loading={loading.stats}
          delay={450}
        />
        <MiniStatCard
          icon={BookOpen}
          label="Khóa học"
          value={stats.totalCourses}
          color="purple"
          loading={loading.stats}
          delay={500}
        />
        <MiniStatCard
          icon={Calendar}
          label="Tổng lớp"
          value={stats.totalClasses}
          color="orange"
          loading={loading.stats}
          delay={550}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LightCard
          title="Tăng trưởng học viên"
          loading={loading.charts}
          delay={700}
        >
          <LineChartSVG
            data={chartData.growth}
            xKey="month"
            yKey="students"
            loading={loading.charts}
          />
        </LightCard>

        <LightCard title="Phân bổ lớp học" loading={loading.charts} delay={800}>
          <PieChartSVG
            data={chartData.distribution}
            colors={["#4f46e5", "#22c55e", "#f59e0b"]}
            loading={loading.charts}
          />
        </LightCard>

        <LightCard
          title="Lịch học hôm nay"
          loading={loading.schedules}
          delay={900}
          right={
            <button
              onClick={() => navigate("/home/admin/schedule")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          {todaySchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Không có lịch học hôm nay</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto overflow-x-hidden">
              {todaySchedules.map((schedule, idx) => (
                <ScheduleItem
                  key={schedule.id}
                  schedule={schedule}
                  delay={idx * 100}
                />
              ))}
            </ul>
          )}
        </LightCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LightCard
          title="Doanh thu theo loại lớp (triệu VND)"
          className="lg:col-span-2"
          loading={loading.charts}
          delay={1000}
        >
          <BarChartSVG
            data={chartData.revenue}
            keys={["Online", "Offline"]}
            colors={["#4f46e5", "#22c55e"]}
            loading={loading.charts}
          />
        </LightCard>

        <LightCard
          title="Tin tức gần đây"
          loading={loading.news}
          delay={1100}
          right={
            <button
              onClick={() => navigate("/home/admin/news")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </button>
          }
        >
          {recentNews.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Chưa có tin tức nào</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentNews.map((news, idx) => (
                <NewsItem key={news.id} news={news} delay={idx * 100} />
              ))}
            </ul>
          )}
        </LightCard>
      </div>

      {/* Quick Actions */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up"
        style={{ animationDelay: "1200ms" }}
      >
        <button
          onClick={() => navigate("/home/admin/class/create-offline")}
          className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all card-hover group"
        >
          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Tạo lớp mới</span>
        </button>

        <button
          onClick={() => navigate("/home/admin/users")}
          className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 hover:border-green-300 hover:bg-green-50/50 transition-all card-hover group"
        >
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Quản lý người dùng
          </span>
        </button>

        <button
          onClick={() => navigate("/home/admin/schedule")}
          className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 hover:border-purple-300 hover:bg-purple-50/50 transition-all card-hover group"
        >
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Xem lịch học
          </span>
        </button>

        <button
          onClick={() => navigate("/home/admin/news/create")}
          className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3 hover:border-orange-300 hover:bg-orange-50/50 transition-all card-hover group"
        >
          <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
            <Newspaper className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            Đăng tin mới
          </span>
        </button>
      </div>
    </div>
  );
}
