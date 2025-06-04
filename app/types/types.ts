// TypeScript types generated from SQL table definitions

export type Job = {
  id: number;
  name: string;
  budget: number;
  comment?: string | null;
};

export type Employee = {
  id: number;
  name: string;
  salary: number;
  skill: string;
  comment?: string | null;
};

export type EmployeeJob = {
  id: number;
  jobId: number;
  employeeId: number;
};

export type EmployeesForProject = {
  employeeJobId: number;
  employeeId: number;
  name: string;
  salary: number;
  skill: string;
  comment?: string | null;
};