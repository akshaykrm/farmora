import type { SetupStatus } from "@app-types/setup.types";

export type SavedIds = {
  farmId?: number;
  seasonId?: number;
  supplierId?: number;
};

export type StepProps = {
  status: SetupStatus;
  onNext: () => void;
  onBack?: () => void;
  onSaved: (summary: string, extra?: SavedIds) => void;
};
