import { Request, Response } from 'express';
import { StormGlassService, ApiError } from '../services/StormGlassService.js'; 

// Coordenadas padrão para São Paulo
const DEFAULT_LAT = '-23.55';
const DEFAULT_LNG = '-46.63';

// Instancia o serviço que contém a lógica de integração
const stormGlassService = new StormGlassService();

/**
 * Controlador para o endpoint de previsão do tempo.
 * Responsável por lidar com a requisição/resposta HTTP.
 */
export class WeatherController {

    public static async getWeatherForecast(req: Request, res: Response): Promise<Response> {
        // 1. Obter os parâmetros (tratamento de lat/lng)
        const lat = req.query.lat?.toString() || DEFAULT_LAT; 
        const lng = req.query.lng?.toString() || DEFAULT_LNG; 

        try {
            // 2. Chamar o Serviço (Lógica de Negócio)
            const forecast = await stormGlassService.fetchForecast(lat, lng);
            
            // 3. Sucesso: Retorna 200 OK
            return res.status(200).json(forecast);

        } catch (error) {
            // 4. Lidar com erros de API e Internos
            if (error instanceof ApiError) {
                // Erros de API (erros conhecidos, como dados não encontrados ou falha de autenticação)
                console.error(`[API Error] Status ${error.status}: ${error.message}`, error.details);
                return res.status(error.status).json({
                    error: error.message,
                    details: error.details,
                });
            }

            // Erros de infraestrutura (erros de rede, falha de I/O)
            console.error('Erro interno do servidor durante a busca:', error);
            return res.status(500).json({ 
                error: 'Erro interno do servidor ao buscar dados meteorológicos.',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
