import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function NetWorthTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: "center", padding: "40px" }}>No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#eee" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="networth" stroke="#4F6EF7" />
      </LineChart>
    </ResponsiveContainer>
  );
}