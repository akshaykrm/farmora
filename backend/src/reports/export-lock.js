import { ExportInProgressError } from '@errors/report.errors'

const running = new Set()

/** Runs `task` while holding the user's export slot; one export per user. */
export const withExportLock = async (userId, task) => {
  if (running.has(userId)) throw new ExportInProgressError()
  running.add(userId)
  try {
    return await task()
  } finally {
    running.delete(userId)
  }
}
