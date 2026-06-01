import type { PlanView } from "../../../types";
import { PlanDocumentPane } from "./PlanDocumentPane";

export function SpecTab({ t }: { t: PlanView }) {
  return <PlanDocumentPane t={t} />;
}
