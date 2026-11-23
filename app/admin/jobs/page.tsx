import PageHeader from "@/components/admin/ui/PageHeader";
import { getJobs } from "@/lib/get-admin-data";
import JobsSection from "@/components/admin/JobsSection";

export default async function AdminJobsPage() {
  const jobs = await getJobs();

  return (
    <div>
      <PageHeader title={"Jobs"} description={"Bank, data, and product roles in Dhaka — some added automatically every day, others added by hand. Track where you stand with each one."} />
      <JobsSection initialItems={jobs} />
    </div>
  );
}
