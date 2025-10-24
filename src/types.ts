// src/types.ts (ou no topo de index.ts)

// Tipagem para um único ponto de dados (ex: airTemperature)
interface StormGlassPointData {
    sg: number; // Valor da previsão da fonte StormGlass (sg)
}

// Tipagem para um objeto de previsão em um determinado horário
interface StormGlassHour {
    time: string;
    airTemperature: StormGlassPointData;
    cloudCover: StormGlassPointData;
    // ... incluir outros parâmetros se necessário
}

// Tipagem para a resposta de sucesso principal da API StormGlass
export interface StormGlassResponse {
    hours: StormGlassHour[];
    meta: {
        // ... metadados
    }
}

// Tipagem para o corpo de erro da API StormGlass
export interface StormGlassErrorBody {
    errors?: {
        // Os erros da StormGlass geralmente são um objeto com chaves de parâmetro
        [key: string]: string[]; 
    };
    // Muitas APIs de erro também podem retornar uma simples mensagem ou código
    code?: number;
    message?: string;
}