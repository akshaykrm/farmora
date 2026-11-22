import PlatformSettings from '@models/platformsettings'

const read = async () => {
  const settings = await PlatformSettings.findByPk(1)
  return {
    subscription_reminder_days: settings?.subscription_reminder_days ?? 10,
  }
}
const save = async ({ subscription_reminder_days }) => {
  await PlatformSettings.upsert({ id: 1, subscription_reminder_days })
  return { subscription_reminder_days }
}
export default { read, save }
