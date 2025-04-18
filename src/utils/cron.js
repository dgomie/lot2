export const triggerCronJob = async ({ legionId }) => {
  try {
    const response = await fetch(`/api/cron/${legionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_LAST_VOTE}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to trigger cron job');
    }
  } catch (error) {
    console.error('Error triggering cron job:', error);
  }
};
