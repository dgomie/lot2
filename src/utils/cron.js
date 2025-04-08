export const triggerCronJob = async () => {
    try {
      const response = await fetch('/api/cron', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to trigger cron job');
      }
    } catch (error) {
      console.error('Error triggering cron job:', error);
    }
  };