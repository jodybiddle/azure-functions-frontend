"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {  Job, EmployeesForProject, Employee } from "@/app/types/types";
import React, { useState } from "react";
import { useParams } from "next/navigation";

const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "GetEmployees", {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
  });
  return response.json();
};

const fetchEmployeesForProject = async (jobId: string): Promise<EmployeesForProject[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "GetEmployeesWithJobId/" + jobId, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
  });
  return response.json();
};

const fetchProject = async (id: string): Promise<Job> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "GetJob/" + id, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
  });
  return response.json();
};

// AddEmployeeModal component
interface AddEmployeeModalProps {
  open: boolean;
  jobId: string;
  onClose: () => void;
  onSubmit: (employee: { employeeId: string }) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ open, jobId, onClose, onSubmit }) => {
  const { data: employees, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const { data: employeesForProject, isLoading: employeesForProjectLoading, error: employeesForProjectError } = useQuery({
    queryKey: ["employeesForProject"],
    queryFn: () => fetchEmployeesForProject(jobId),
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState("");

  if (!open) return null;

  const employeesToSelectFrom = employees?.filter((employee: Employee) => !employeesForProject?.some((e: EmployeesForProject) => e.employeeId === employee.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeId) {
      onSubmit({ employeeId: selectedEmployeeId });
      setSelectedEmployeeId("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Employee to Project</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="mb-1">Select Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              required
              className="border border-neutral-700 rounded px-2 py-1 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select an employee...</option>
              {isLoading && <option>Loading...</option>}
              {error && <option>Error loading employees</option>}
              {employeesToSelectFrom && employeesToSelectFrom.map((emp: Employee) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.skill})
                </option>
              ))}
            </select>
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
              disabled={!selectedEmployeeId}
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function EmployeesForProject() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["employeesForProject"],
    queryFn: () => fetchEmployeesForProject(id as string),

  });

  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ["project"],
    queryFn: () => fetchProject(id as string),
    
  });
  const queryClient = useQueryClient();
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [employeeJobIdToDelete, setEmployeeJobIdToDelete] = useState<number | null>(null);
  const createEmployeeMutation = useMutation({
    mutationFn: async ({ employeeId, jobId }: { employeeId: string; jobId: string }) => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "CreateEmployeeJob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify({ EmployeeId: Number(employeeId), JobId: Number(jobId) }),
      });
      if (!response.ok) {
        throw new Error("Failed to assign employee to project");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeesForProject"] });
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

  const deleteEmployeeJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "DeleteEmployeeJob/" + id, {
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
      queryClient.invalidateQueries({ queryKey: ["employeesForProject"] });
      setIsDeleteConfirmOpen(false);
      setEmployeeJobIdToDelete(null);
    },
  });
  
  const handleAddEmployee = (employee: { employeeId: string }) => {
    createEmployeeMutation.mutate({ employeeId: employee.employeeId, jobId: id as string }, {
      onSuccess: () => setIsAddEmployeeModalOpen(false),
    });
  };

  return (
    <div className="py-8 flex justify-center bg-neutral-100 dark:bg-neutral-950 min-h-screen">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8">
        <div className="flex flex-col gap-4 mb-6">
          {project && <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{`Project: ${project.name}`}</h1>}
          <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">List of employees assigned to this project</h2>
          {isLoading && <p className="text-gray-400 text-sm">Loading... Might take a second for the database to spin up (cold starts are real)...</p>}
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
                {data.map((employee: EmployeesForProject) => (
                  <tr key={employee.employeeJobId} className="even:bg-neutral-50 dark:even:bg-neutral-800">
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.employeeJobId}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.name}</td>
                    <td className="px-4 py-2 text-right text-neutral-900 dark:text-white">{employee.salary.toLocaleString(undefined, { style: 'currency', currency: 'AUD' })}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.skill}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{employee.comment ?? ""}</td>
                    <td className="px-4 py-2 flex gap-4 justify-center">
                      <button
                        aria-label="Delete Employee"
                        className="hover:text-red-500"
                        onClick={() => {
                          setEmployeeJobIdToDelete(employee.employeeJobId);
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
            <p className="text-lg text-gray-400">No employees found for this project.</p>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors" onClick={() => setIsAddEmployeeModalOpen(true)}>
            Add Employee To Project
          </button>
          {createEmployeeMutation.isPending && <span className="ml-4 text-blue-600">Adding...</span>}
          {createEmployeeMutation.isError && <span className="ml-4 text-red-600">Error: {(createEmployeeMutation.error as Error)?.message}</span>}
        </div>
        
        <AddEmployeeModal open={isAddEmployeeModalOpen} jobId={id as string} onClose={() => setIsAddEmployeeModalOpen(false)} onSubmit={handleAddEmployee} />
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
                    setEmployeeJobIdToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-red-700 rounded bg-red-700 text-white hover:bg-red-800"
                  onClick={() => {
                    if (employeeJobIdToDelete !== null) {
                      deleteEmployeeJobMutation.mutate(employeeJobIdToDelete);
                    }
                  }}
                  disabled={deleteEmployeeJobMutation.isPending}
                >
                  {deleteEmployeeJobMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
              {deleteEmployeeJobMutation.isError && (
                <div className="text-red-400 mt-2">Error: {(deleteEmployeeJobMutation.error as Error)?.message}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
