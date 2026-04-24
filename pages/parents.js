import React, { useEffect, useState } from "react";
import ParentsTable from "../components/ParentsTable";

export default function ParentsPage() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parents")
      .then((res) => res.json())
      .then((data) => {
        setParents(data.parents || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Parents</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ParentsTable parents={parents} />
      )}
    </div>
  );
}
