export type Role = "management" | "warden" | "staff";

export type User = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  language: "en" | "te" | "hi";
};

export type Student = {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  dorm: string;
  gender: "boy" | "girl";
  parentName: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

export type TaskStatus = "done" | "open" | "missed" | "upcoming";
export type ProofType = "photo" | "count" | "tap";

export type Task = {
  id: string;
  time: string;
  name: string;
  meta: string;
  status: TaskStatus;
  proofType: ProofType;
  assignedTo: string;
};

export type Outing = {
  id: string;
  studentName: string;
  studentClass: string;
  type: "regular" | "special" | "sick_pickup";
  reason?: string;
  reasonNote?: string;
  startedAt: string;
  expectedReturn?: string;
  approvedBy?: string;
};

export type SickLog = {
  id: string;
  studentName: string;
  studentClass: string;
  symptoms: string;
  reportedAt: string;
  parentCalledAt?: string;
  outcome?: "resting" | "sent_home" | "at_doctor" | "recovered";
  daysActive?: number;
};

export type Alert = {
  id: string;
  severity: "red" | "yellow";
  title: string;
  meta: string;
  time: string;
};
