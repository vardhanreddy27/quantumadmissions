import React, { useEffect, useState } from "react";
import StudentsTable from "../components/StudentsTable";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Students</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <StudentsTable students={students} />
      )}
    </div>
  );
}
