import cron from 'node-cron';
import { checkSubmissionDeadlines } from './cron/checkDeadlines';

const startCronJob = () => {
  cron.schedule('0 * * * *', () => {
    console.log('Checking for rounds past submission deadlines...');
    checkSubmissionDeadlines();
  });
};

startCronJob();