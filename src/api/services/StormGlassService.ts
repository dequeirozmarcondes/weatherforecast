import { 
    StormGlassResponse, 
    StormGlassErrorBody, 
    WeatherForecastResponse 
} from '../../types.js'; // Ajuste de extensão para NodeNext

import { STORMGLASS_API_KEY } from '../../config.js'; 

// Parâmetros da API que estamos interessados
const API_PARAMS = ['airTemperature', 'cloudCover'].join(',');

/**
 * Erro personalizado para encapsular erros de API externa (4xx, 5xx).
 */
export class ApiError extends Error {
    public status: number;
    public details: any;

    constructor(message: string, status: number, details?: any) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
        this.details = details;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * Serviço responsável por interagir com a API StormGlass.
 */
export class StormGlassService {

    /**
     * Busca a previsão do tempo na StormGlass e retorna dados formatados.
     * @param lat Latitude.
     * @param lng Longitude.
     * @returns Um objeto WeatherForecastResponse com a previsão formatada.
     * @throws {ApiError} Se houver um erro de API ou dados insuficientes.
     */
    public async fetchForecast(lat: string, lng: string): Promise<WeatherForecastResponse> {
        const apiUrl = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${API_PARAMS}`;

        if (!STORMGLASS_API_KEY) {
             throw new Error('Chave de API StormGlass não disponível.');
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': STORMGLASS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Tratamento de Erro da API Externa
            const errorBody = await response.json() as StormGlassErrorBody;
            const details = errorBody.errors || errorBody;

            throw new ApiError(
                `Erro ao acessar API externa (${response.status})`,
                response.status,
                details
            );
        }
        
        const data = await response.json() as StormGlassResponse;
        
        // Validação de negócio (dados vazios)
        if (!data.hours || data.hours.length === 0) {
            throw new ApiError(
                'Nenhum dado de previsão encontrado para as coordenadas.',
                404
            );
        }
        
        return this.formatData(lat, lng, data);
    }

    /**
     * Formata os dados brutos da StormGlass para o formato da nossa API.
     */
    private formatData(
        lat: string, 
        lng: string, 
        rawData: StormGlassResponse
    ): WeatherForecastResponse {
        const latestData = rawData.hours[0]!; 
        
        // Formatação dos números com segurança
        const tempC = latestData.airTemperature.sg ? latestData.airTemperature.sg.toFixed(1) : 'N/A';
        const cloudCover = latestData.cloudCover.sg ? latestData.cloudCover.sg.toFixed(0) : 'N/A';

        return {
            latitude: lat,
            longitude: lng,
            timestamp: latestData.time,
            temperatureCelsius: tempC,
            cloudCoverPercent: cloudCover,
            source: 'StormGlass.io',
        };
    }
}
