import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#4F6EF7", "#22D3A0", "#F75F5F", "#F7A84F"];

export default function ExpenseCategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: "center", padding: "40px" }}>No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}