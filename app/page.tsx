"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Job } from "./types/types";
import React, { useState } from "react";
import Link from "next/link";

const fetchProjects = async (): Promise<Job[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "GetJobs", {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    },
  });
  return response.json();
};

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(),
  });

  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: async (job: { name: string; budget: number; comment?: string }) => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "CreateJob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify(job),
      });
      if (!response.ok) {
        throw new Error("Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState<number | null>(null);

  const handleAddJob = (job: { name: string; budget: number; comment?: string }) => {
    createJobMutation.mutate(job, {
      onSuccess: () => setIsAddJobModalOpen(false),
    });
  };

  const updateJobMutation = useMutation({
    mutationFn: async (job: { id: number; name: string; budget: number; comment?: string }) => {
      const apiJob = {
        Id: job.id,
        Name: job.name,
        Budget: job.budget,
        Comment: job.comment,
      };
      console.log(JSON.stringify(apiJob));
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "UpdateJob", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify(apiJob),
      });
      if (!response.ok) {
        throw new Error("Failed to update job");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("updateJobMutation.onError", error);
    }
  });

  const handleEditJob = (job: { id: number; name: string; budget: number; comment?: string }) => {
    updateJobMutation.mutate(job, {
      onSuccess: () => setIsEditJobModalOpen(false),
    });
  };

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "DeleteJob/" + id, {
        method: "DELETE",
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.NEXT_PUBLIC_API_KEY ?? "",
        },
        body: JSON.stringify({ Id: id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDeleteConfirmOpen(false);
      setJobIdToDelete(null);
    },
  });

  return (
    <div className="py-8 flex justify-center bg-neutral-100 dark:bg-neutral-950 min-h-screen">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Project List</h1>
          {isLoading && <p className="text-gray-400 text-sm">Loading... Might take a second for the database to spin up (cold starts are real)...</p>}
          {error && <p className="text-red-600">Error: {error.message}</p>}
        </div>
        {Array.isArray(data) && data.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 mb-6">
            <table className="min-w-full bg-white dark:bg-neutral-900">
              <thead className="bg-neutral-200 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">Project Name</th>
                  <th className="px-4 py-2 text-right font-semibold text-neutral-700 dark:text-neutral-200">Budget</th>
                  <th className="px-4 py-2 text-left font-semibold text-neutral-700 dark:text-neutral-200">Comment</th>
                  <th className="px-4 py-2 text-center font-semibold text-neutral-700 dark:text-neutral-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((job: Job) => (
                  <tr key={job.id} className="even:bg-neutral-50 dark:even:bg-neutral-800">
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{job.id}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">
                      <Link className="hover:text-blue-500 underline" href={`/project/${job.id}`}>{job.name}</Link>
                    </td>
                    <td className="px-4 py-2 text-right text-neutral-900 dark:text-white">{job.budget.toLocaleString(undefined, { style: 'currency', currency: 'AUD' })}</td>
                    <td className="px-4 py-2 text-neutral-900 dark:text-white">{job.comment ?? ""}</td>
                    <td className="px-4 py-2 flex gap-4 justify-center">
                      <button
                        aria-label="Edit Job"
                        className="hover:text-blue-500"
                        onClick={() => {
                          setSelectedJob(job);
                          setIsEditJobModalOpen(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303z" />
                        </svg>
                      </button>
                      <button
                        aria-label="Delete Job"
                        className="hover:text-red-500"
                        onClick={() => {
                          setJobIdToDelete(job.id);
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
            <p className="text-lg text-gray-400">No jobs found.</p>
          </div>
        )}
        {Array.isArray(data) && data.length > 0 && (
        <div className="flex justify-end mt-4 items-center gap-4">
          <p className="text-sm text-gray-400">Click project name to view employees assigned to project</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition-colors" onClick={() => setIsAddJobModalOpen(true)}>
            Add Job
          </button>
        </div>
        )}
        {createJobMutation.isPending && <span className="ml-4 text-blue-600">Adding...</span>}
        {createJobMutation.isError && <span className="ml-4 text-red-600">Error: {(createJobMutation.error as Error)?.message}</span>}
        <AddJobModal open={isAddJobModalOpen} onClose={() => setIsAddJobModalOpen(false)} onSubmit={handleAddJob} />
        <EditJobModal
          open={isEditJobModalOpen}
          job={selectedJob}
          onClose={() => setIsEditJobModalOpen(false)}
          onSubmit={handleEditJob}
        />
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Delete Job</h2>
              <p>Are you sure you want to delete this job?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 border border-neutral-700 rounded bg-neutral-700 text-white hover:bg-neutral-600"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setJobIdToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-red-700 rounded bg-red-700 text-white hover:bg-red-800"
                  onClick={() => {
                    if (jobIdToDelete !== null) {
                      deleteJobMutation.mutate(jobIdToDelete);
                    }
                  }}
                  disabled={deleteJobMutation.isPending}
                >
                  {deleteJobMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
              {deleteJobMutation.isError && (
                <div className="text-red-400 mt-2">Error: {(deleteJobMutation.error as Error)?.message}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AddJobModal component for adding a new job
interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (job: { name: string; budget: number; comment?: string }) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);
  const [comment, setComment] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, budget, comment });
    setName("");
    setBudget(0);
    setComment("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Job</h2>
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
            <span className="mb-1">Budget</span>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              min={0}
              step={0.01}
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
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// EditJobModal component for editing an existing job
interface EditJobModalProps {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSubmit: (job: { id: number; name: string; budget: number; comment?: string }) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ open, job, onClose, onSubmit }) => {
  const [name, setName] = useState(job?.name || "");
  const [budget, setBudget] = useState(job?.budget || 0);
  const [comment, setComment] = useState(job?.comment || "");

  React.useEffect(() => {
    setName(job?.name || "");
    setBudget(job?.budget || 0);
    setComment(job?.comment || "");
  }, [job]);

  if (!open || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: job.id, name, budget, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white rounded-lg shadow-2xl border border-neutral-700 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Job</h2>
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
            <span className="mb-1">Budget</span>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              min={0}
              step={0.01}
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
