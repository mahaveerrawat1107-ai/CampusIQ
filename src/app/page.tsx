import { DashboardHeader } from "@/components/home/DashboardHeader";
import { AttendanceCard } from "@/components/home/AttendanceCard";
import { QuickStatsCards } from "@/components/home/QuickStatsCards";
import { UpcomingAssignments } from "@/components/home/UpcomingAssignments";
import { RecentNotes } from "@/components/home/RecentNotes";
import { QuickActions } from "@/components/home/QuickActions";
import {
  mockStudent,
} from "@/data/mockHomeData";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* A. Header */}
      <DashboardHeader studentName={mockStudent.name} />

      {/* Top Grid: Attendance Overview + Quick Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* B. Attendance Overview (7 cols on large desktop) */}
        <div className="lg:col-span-7">
          <AttendanceCard />
        </div>

        {/* C. Quick Statistics (5 cols on large desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <QuickStatsCards />
        </div>
      </div>

      {/* Middle Grid: Upcoming Assignments + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* D. Upcoming Assignments */}
        <div className="lg:col-span-7">
          <UpcomingAssignments />
        </div>

        {/* E. Recent Notes */}
        <div className="lg:col-span-5">
          <RecentNotes />
        </div>
      </div>

      {/* F. Quick Actions */}
      <div>
        <QuickActions />
      </div>
    </div>
  );
}
