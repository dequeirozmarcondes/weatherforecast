import express, { Application } from 'express';
import { WeatherController } from './api/controllers/WeatherController.js'; 

// 1. Cria a instância do Express
const app: Application = express();

// 2. Configura middlewares
app.use(express.json()); 

// 3. Define as rotas
app.get('/weatherforecast', WeatherController.getWeatherForecast);

// Rota de Health Check para verificar se o app está rodando
app.get('/health', (_, res) => {
    res.status(200).json({ status: 'UP', service: 'weather-api' });
});

// 4. Exporta a instância para ser usada pelo server.ts
export { app };
