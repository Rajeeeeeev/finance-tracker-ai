import React from "react";

import { useDashboard } from "../hooks/useDashboard";

const Dashboard = () => {

  const { data, loading, error } = useDashboard();

  if (loading) return <h2>Loading dashboard...</h2>;

  if (error) return <h2>Error: {error}</h2>;

  return (

    <div style={{ padding: "20px" }}>

      <h1>Financial Summary Dashboard</h1>

      <hr />

      <h3>Net Balance: ₹{data.net_balance}</h3>

      <h3>Net Worth: ₹{data.net_worth}</h3>

      <h3>Total Income: ₹{data.total_income}</h3>

      <h3>Total Expenses: ₹{data.total_expenses}</h3>

      <h3>Total Savings: ₹{data.total_savings}</h3>

      <h3>Total Invested: ₹{data.total_invested}</h3>

    </div>

  );

};

export default Dashboard;