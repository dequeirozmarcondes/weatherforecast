// Estrutura do corpo de erro da StormGlass API
export interface StormGlassErrorBody {
    errors?: Record<string, string[]> | string; // Pode ser um objeto com listas de erros ou uma string
    message?: string;
}

// Representa um ponto de dados (e.g., airTemperature) em uma hora específica
export interface DataPoint {
    sg: number; // Fonte: StormGlass
}

// Representa a previsão do tempo para uma hora específica
export interface HourData {
    time: string;
    airTemperature: DataPoint;
    cloudCover: DataPoint;
}

// Estrutura da resposta de sucesso da StormGlass API
export interface StormGlassResponse {
    hours: HourData[];
    meta: {
        cost: number;
        dailyQuota: number;
    };
}

// Estrutura de resposta padronizada para o nosso endpoint
export interface WeatherForecastResponse {
    latitude: string;
    longitude: string;
    timestamp: string;
    temperatureCelsius: string;
    cloudCoverPercent: string;
    source: 'StormGlass.io';
}
