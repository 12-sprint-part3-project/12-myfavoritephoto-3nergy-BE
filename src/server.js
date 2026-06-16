import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

const databaseName = process.env.DATABASE_NAME;

app.listen(PORT, () => {
  console.log(`Connected DB: ${databaseName}`);
  console.log(`Server running on port ${PORT}`);
});
