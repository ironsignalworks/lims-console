import { DashboardClient } from "../dashboard/DashboardClient";

/** Same console as `/` — keeps `/dashboard` working when embedded or linked from the pitch site. */
export default function DashboardPage() {
  return <DashboardClient />;
}
