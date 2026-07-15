import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: { name: "", rollNo: "", marks: "", gender: "Male" },
  });

  const rollNoValue = watch("rollNo");

  useEffect(() => {
    if (typeof rollNoValue === "string") {
      const trimmed = rollNoValue.trim();
      if (trimmed !== rollNoValue) setValue("rollNo", trimmed);
    }
  }, [rollNoValue, setValue]);

  const onSubmit = (data) => {
    const payload = {
      name: data.name.trim(),
      rollNo: String(data.rollNo).trim(),
      marks: Number(data.marks),
      gender: data.gender,
    };

    const exists = students.some(
      (s) => s.rollNo === payload.rollNo && s.rollNo !== editingId
    );

    if (exists) {
      alert(`Roll No ${payload.rollNo} already exists!`);
      return;
    }

    if (editingId) {
      setStudents((prev) =>
        prev.map((s) => (s.rollNo === editingId ? { ...payload } : s))
      );
      alert("Student updated successfully");
    } else {
      setStudents((prev) => [{ ...payload }, ...prev]);
      alert("Student added successfully");
    }

    setEditingId(null);
    reset({ name: "", rollNo: "", marks: "", gender: "Male" });
  };

  const onEdit = (student) => {
    setEditingId(student.rollNo);
    reset(student);
  };

  const onDelete = (rollNo) => {
    setStudents((prev) => prev.filter((s) => s.rollNo !== rollNo));
    alert("Student deleted successfully");
  };

  const maleStudents = useMemo(
    () => students.filter((s) => s.gender === "Male"),
    [students]
  );

  const femaleStudents = useMemo(
    () => students.filter((s) => s.gender === "Female"),
    [students]
  );

  const avg = (arr) =>
    arr.length
      ? (
          arr.reduce((sum, s) => sum + Number(s.marks || 0), 0) / arr.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="container">
      <h1>Student Information Record</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div>
          <label>Name</label>
          <input {...register("name", { required: "Name is required" })} />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div>
          <label>Roll No</label>
          <input
            {...register("rollNo", {
              required: "Roll No is required",
              validate: (v) => {
                const value = String(v || "").trim();
                if (!value) return "Roll No is required";

                const exists = students.some(
                  (s) => s.rollNo === value && s.rollNo !== editingId
                );

                return exists ? "Roll No must be unique" : true;
              },
            })}
          />
          {errors.rollNo && (
            <span className="error">{errors.rollNo.message}</span>
          )}
        </div>

        <div>
          <label>Marks</label>
          <input
            type="number"
            {...register("marks", {
              required: "Marks required",
              min: { value: 0, message: "Min 0" },
              max: { value: 100, message: "Max 100" },
            })}
          />
          {errors.marks && (
            <span className="error">{errors.marks.message}</span>
          )}
        </div>

        <div>
          <label>Gender</label>
          <select {...register("gender")}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <button type="submit">
          {editingId ? "Update Student" : "Add Student"}
        </button>
      </form>

      <h2>Statistics</h2>
      <p>Average Marks (Male): {avg(maleStudents)}</p>
      <p>Average Marks (Female): {avg(femaleStudents)}</p>

      <h2>Male Students</h2>
      <StudentTable rows={maleStudents} onEdit={onEdit} onDelete={onDelete} />

      <h2>Female Students</h2>
      <StudentTable rows={femaleStudents} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function StudentTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <p>No Records</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll</th>
          <th>Marks</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((s) => (
          <tr key={s.rollNo}>
            <td>{s.name}</td>
            <td>{s.rollNo}</td>
            <td>{s.marks}</td>
            <td>{s.marks >= 40 ? "Pass" : "Fail"}</td>

            <td>
              <button onClick={() => onEdit(s)}>Edit</button>
              <button onClick={() => onDelete(s.rollNo)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;