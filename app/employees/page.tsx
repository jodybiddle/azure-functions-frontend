"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "../types/types";
import React, { useState } from "react";

const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "GetEmployees", {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
  });
  return response.json();
};

// AddEmployeeModal component
interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (employee: { name: string; salary: number; skill: string; comment?: string }) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [salary, setSalary] = useState(0);
  const [skill, setSkill] = useState("");
  const [comment, setComment] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, salary, skill, comment });
    setName("");
    setSalary(0);
    setSkill("");
    setComment("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="mb-1">Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Salary</span>
            <input
              type="number"
              value={salary}
              onChange={e => setSalary(Number(e.target.value))}
              min={0}
              step={0.01}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Skill</span>
            <input
              type="text"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Comment</span>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-700 rounded bg-neutral-700 text-white hover:bg-neutral-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-blue-700 rounded bg-blue-700 text-white hover:bg-blue-800 font-semibold"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// EditEmployeeModal component
interface EditEmployeeModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSubmit: (employee: { id: number; name: string; salary: number; skill: string; comment?: string }) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ open, employee, onClose, onSubmit }) => {
  const [name, setName] = useState(employee?.name || "");
  const [salary, setSalary] = useState(employee?.salary || 0);
  const [skill, setSkill] = useState(employee?.skill || "");
  const [comment, setComment] = useState(employee?.comment || "");

  React.useEffect(() => {
    setName(employee?.name || "");
    setSalary(employee?.salary || 0);
    setSkill(employee?.skill || "");
    setComment(employee?.comment || "");
  }, [employee]);

  if (!open || !employee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: employee.id, name, salary, skill, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="mb-1">Name</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Salary</span>
            <input
              type="number"
              value={salary}
              onChange={e => setSalary(Number(e.target.value))}
              min={0}
              step={0.01}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Skill</span>
            <input
              type="text"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-1">Comment</span>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-700 rounded bg-neutral-700 text-white hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-blue-700 rounded bg-blue-700 text-white hover:bg-blue-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Employees() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: () => fetchEmployees(),
  });

  const queryClient = useQueryClient();
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<number | null>(null);

  const createEmployeeMutation = useMutation({
    mutationFn: async (employee: { name: string; salary: number; skill: string; comment?: string }) => {
      // Map to API's expected property names
      const apiEmployee = {
        Name: employee.name,
        Salary: employee.salary,
        Skill: employee.skill,
        Comment: employee.comment,
      };
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "CreateEmployee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify(apiEmployee),
      });
      if (!response.ok) {
        throw new Error("Failed to create employee");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (employee: { id: number; name: string; salary: number; skill: string; comment?: string }) => {
      const apiEmployee = {
        Id: employee.id,
        Name: employee.name,
        Salary: employee.salary,
        Skill: employee.skill,
        Comment: employee.comment,
      };
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "UpdateEmployee", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify(apiEmployee),
      });
      if (!response.ok) {
        throw new Error("Failed to update employee");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "DeleteEmployee/" + id, {
        method: "DELETE",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDeleteConfirmOpen(false);
      setEmployeeIdToDelete(null);
    },
  });

  const handleAddEmployee = (employee: { name: string; salary: number; skill: string; comment?: string }) => {
    createEmployeeMutation.mutate(employee, {
      onSuccess: () => setIsAddEmployeeModalOpen(false),
    });
  };

  const handleEditEmployee = (employee: { id: number; name: string; salary: number; skill: string; comment?: string }) => {
    updateEmployeeMutation.mutate(employee, {
      onSuccess: () => setIsEditEmployeeModalOpen(false),
    });
  };

  return (
    <div className="py-8 flex justify-center bg-neutral-100 dark:bg-neutral-950 min-h-screen">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Employee List</h1>
          {isLoading && <p className="text-blue-600">Loading... Might take a second for the database to spin up...</p>}
          {error && <p className="text-red-600">Error: {error.message}</p>}
        </div>
        {Array.isArray(data) && data.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 mb-6">
            <table className="min-w-full bg-white dark:bg-neutral-900">
              <thead className="bg-neutral-200 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">Name</th>
                  <th className="px-4 py-2 text-right font-semibold text-neutral-700 dark:text-neutral-200">Salary</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">Skill</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">Comment</th>
                  <th className="px-4 py-2 text-center font-semibold text-neutral-700 dark:text-neutral-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((employee: Employee) => (
                  <tr key={employee.id} className="even:bg-neutral-50 dark:even:bg-neutral-800">
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.id}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.name}</td>
                    <td className="px-4 py-2 text-right text-neutral-900 dark:text-white">{employee.salary.toLocaleString(undefined, { style: 'currency', currency: 'AUD' })}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.skill}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.comment ?? ""}</td>
                    <td className="px-4 py-2 flex gap-4 justify-center">
                      <button
                        aria-label="Edit Employee"
                        className="hover:text-blue-500"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEditEmployeeModalOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303z" />
                        </svg>
                      </button>
                      <button
                        aria-label="Delete Employee"
                        className="hover:text-red-500"
                        onClick={() => {
                          setEmployeeIdToDelete(employee.id);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {Array.isArray(data) && data.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <p className="text-lg text-gray-400">No employees found.</p>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors" onClick={() => setIsAddEmployeeModalOpen(true)}>
            Add Employee
          </button>
          {createEmployeeMutation.isPending && <span className="ml-4 text-blue-600">Adding...</span>}
          {createEmployeeMutation.isError && <span className="ml-4 text-red-600">Error: {(createEmployeeMutation.error as Error)?.message}</span>}
        </div>
        <AddEmployeeModal open={isAddEmployeeModalOpen} onClose={() => setIsAddEmployeeModalOpen(false)} onSubmit={handleAddEmployee} />
        <EditEmployeeModal
          open={isEditEmployeeModalOpen}
          employee={selectedEmployee}
          onClose={() => setIsEditEmployeeModalOpen(false)}
          onSubmit={handleEditEmployee}
        />
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Delete Employee</h2>
              <p>Are you sure you want to delete this employee?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 border border-neutral-700 rounded bg-neutral-700 text-white hover:bg-neutral-600"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setEmployeeIdToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-red-700 rounded bg-red-700 text-white hover:bg-red-800"
                  onClick={() => {
                    if (employeeIdToDelete !== null) {
                      deleteEmployeeMutation.mutate(employeeIdToDelete);
                    }
                  }}
                  disabled={deleteEmployeeMutation.isPending}
                >
                  {deleteEmployeeMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
              {deleteEmployeeMutation.isError && (
                <div className="text-red-400 mt-2">Error: {(deleteEmployeeMutation.error as Error)?.message}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
