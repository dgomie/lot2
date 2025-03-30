# Cron Job Notifications

This project implements a cron job that checks Firebase for rounds that have passed their submission deadlines. When a deadline is reached, it sends a push notification to users, informing them that a new playlist is available in the specified legion.

## Project Structure

```
cron-job-notifications
├── src
│   ├── cron
│   │   └── checkDeadlines.js        # Logic for the cron job to check deadlines
│   ├── firebase
│   │   ├── firebaseConfig.js        # Firebase configuration
│   │   └── roundService.js          # Functions for interacting with Firebase
│   ├── notifications
│   │   └── pushNotificationService.js # Service for sending push notifications
│   └── index.js                     # Entry point of the application
├── package.json                     # npm configuration file
├── .env                             # Environment variables
└── README.md                        # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd cron-job-notifications
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   - Create a Firebase project and obtain your configuration details (API key, project ID, etc.).
   - Update the `src/firebase/firebaseConfig.js` file with your Firebase credentials.

4. **Set up environment variables:**
   - Create a `.env` file in the root directory and add your Firebase credentials and any other necessary environment variables.

5. **Run the cron job:**
   - Start the application by running:
   ```bash
   node src/index.js
   ```

## Usage

The cron job will automatically check for rounds that have passed their submission deadlines at specified intervals. When a deadline is reached, users will receive a push notification informing them of the new playlist available in the respective legion.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.