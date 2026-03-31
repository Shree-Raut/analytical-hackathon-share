/**
 * Orchestrator barrel export.
 */

export { processReport } from './orchestrator';
export { validateAll } from './validationRules';
export { sha256 } from './hashUtils';
export { detectConflicts } from './conflictDetector';
export { StubNotificationChannel } from './notificationChannel';
export {
  triggerScan,
  manualTrigger,
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
} from './scanScheduler';
export type { LlmClient, ExistingLayerSnapshot } from './llmClient';
