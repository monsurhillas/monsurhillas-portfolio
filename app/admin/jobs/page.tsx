import { getJobs } from "@/lib/get-admin-data";
import JobsSection from "@/components/admin/JobsSection";

export default async function AdminJobsPage() {
  const jobs = await getJobs();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted">
          Bank, data, and product roles in Dhaka — some added automatically
          every day, others added by hand. Track where you stand with each
          one.
        </p>
      </div>
      <JobsSection initialItems={jobs} />
    </div>
  );
}
