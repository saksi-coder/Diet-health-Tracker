import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTodayLog, getLogsRange } from "../api/logsApi";
import { calculateBMI, getBMICategory } from "../utils/bmiCalculator";
import MetricCard from "../components/MetricCard";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import "./Dashboard.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip glass-card">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState(null);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [today, weekly] = await Promise.all([
        getTodayLog().catch(() => null),
        getLogsRange(7).catch(() => []),
      ]);
      setTodayLog(today);
      setWeeklyLogs(Array.isArray(weekly) ? weekly : []);
    } catch (err) {
      if (err.response?.status === 404) {
        setTodayLog(null);
        setWeeklyLogs([]);
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;
  if (error) return <div className="page-container"><ErrorMessage message={error} onRetry={fetchData} /></div>;

  const calorieIntake = todayLog?.totalCalories || 0;
  const calorieGoal = user?.calorieGoal || 2000;
  const waterIntake = todayLog?.totalWater || 0;
  const waterGoal = user?.waterGoal || 2500;
  const weight = todayLog?.weight || user?.weight || 0;
  const height = user?.height || 0;
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const exerciseDuration = todayLog?.totalExerciseDuration || 0;
  const exerciseCalories = todayLog?.totalExerciseCalories || 0;

  // Prepare chart data
  const weightData = weeklyLogs
    .filter((log) => log.weight)
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
      weight: log.weight,
    }));

  const calorieData = weeklyLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
    calories: log.totalCalories || 0,
    goal: calorieGoal,
  }));

  const waterData = weeklyLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
    water: log.totalWater || 0,
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0] || "User"} 👋</h1>
        <p>Here's your health summary for today</p>
      </div>

      {/* Metric Cards */}
      <div className="grid-4 dashboard-cards">
        <MetricCard
          title="Calories"
          value={calorieIntake}
          unit="kcal"
          color="var(--color-primary-light)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0112 18a5 5 0 01-3.5-11.5C9.5 5.5 11 5 12 2z" /></svg>
          }
        >
          <ProgressBar value={calorieIntake} max={calorieGoal} color="var(--color-primary)" label="Daily Goal" size="sm" />
        </MetricCard>

        <MetricCard
          title="Hydration"
          value={waterIntake}
          unit="ml"
          color="var(--color-info)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l-5.5 9A6.5 6.5 0 0012 22a6.5 6.5 0 005.5-11L12 2z" /></svg>
          }
        >
          <ProgressBar value={waterIntake} max={waterGoal} color="var(--color-info)" label="Daily Goal" size="sm" />
        </MetricCard>

        <MetricCard
          title="BMI"
          value={bmi || "—"}
          badge={bmiCategory.label}
          badgeClass={bmiCategory.badgeClass}
          color={bmiCategory.color}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
          }
        />

        <MetricCard
          title="Exercise"
          value={exerciseDuration}
          unit="min"
          color="var(--color-accent)"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M6 8H5a4 4 0 000 8h1" /><line x1="6" y1="12" x2="18" y2="12" /></svg>
          }
          badge={exerciseCalories ? `${exerciseCalories} kcal burned` : null}
          badgeClass="badge-green"
        />
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        {/* Weight Trend */}
        <div className="chart-card glass-card animate-slide-up">
          <h3 className="chart-title">Weight Trend</h3>
          <p className="chart-subtitle">Last 7 days</p>
          {weightData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={3} dot={{ fill: "var(--color-accent)", r: 5 }} activeDot={{ r: 7, fill: "var(--color-accent)" }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No weight data" message="Log your weight to see trends here." />
          )}
        </div>

        {/* Calorie Intake */}
        <div className="chart-card glass-card animate-slide-up">
          <h3 className="chart-title">Calorie Intake</h3>
          <p className="chart-subtitle">Last 7 days vs daily goal</p>
          {calorieData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={calorieGoal} stroke="var(--color-warning)" strokeDasharray="5 5" label={{ value: "Goal", fill: "var(--color-warning)", fontSize: 12 }} />
                  <Bar dataKey="calories" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No calorie data" message="Start logging meals to see your intake trends." />
          )}
        </div>

        {/* Water Intake */}
        <div className="chart-card glass-card animate-slide-up">
          <h3 className="chart-title">Water Intake</h3>
          <p className="chart-subtitle">Last 7 days</p>
          {waterData.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={waterData}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="water" stroke="var(--color-info)" strokeWidth={3} fill="url(#waterGradient)" name="Water (ml)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No water data" message="Track your hydration to see water intake over time." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
