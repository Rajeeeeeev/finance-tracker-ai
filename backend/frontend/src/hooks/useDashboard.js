import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";

export const useDashboard = () => {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        setLoading(true);

        const result =
          await dashboardService.getFinancialSummary();

        console.log("Dashboard data:", result);

        setData(result);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchDashboard();

  }, []);

  return { data, loading, error };

};