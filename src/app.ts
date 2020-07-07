import express from 'express';
import api from './routes';

const PORT = process.env.PORT || 5000;
const app = express();

app.use('/api', api);

export const start = () => {
  return app.listen(PORT, () => {
    console.log(`Server running on Port: ${PORT}`)
  });
};