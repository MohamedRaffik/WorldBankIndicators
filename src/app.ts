import express from 'express';
import api from './routes';
import path from 'path';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/api', api);

app.use('*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

export const start = () => {
  return app.listen(PORT, () => {
    console.log(`Server running on Port: ${PORT}`)
  });
};