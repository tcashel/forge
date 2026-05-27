import { useEffect } from "preact/hooks";
import { activitySelectedId } from "../../signals/ui";
import { ActivityDetail } from "./ActivityDetail";
import { ActivityTable } from "./ActivityTable";

export function ActivityView() {
  // Clear any drill-in selection when the user mounts the view fresh.
  useEffect(() => {
    if (activitySelectedId.value && !document.body.dataset.activityRestoreSelection) {
      activitySelectedId.value = null;
    }
  }, []);

  return (
    <div class="activity-view">
      <div class="activity-table-wrap">
        <ActivityTable />
      </div>
      <div class="activity-detail-wrap">
        <ActivityDetail />
      </div>
    </div>
  );
}
