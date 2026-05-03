import connectToDatabase from '@/utils/db';

(async function main() {
  try {
    const conn = await connectToDatabase();
    // mongoose connection states: 0 = disconnected, 1 = connected
    // `conn` may be the mongoose module or connection depending on version
    // Try to read `connection.readyState` if present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = (conn as any).connection ? (conn as any).connection.readyState : 1;
    console.log('MongoDB connection state:', state === 1 ? 'connected' : state);
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
})();
