import 'dotenv/config';
import express, { Request, Response } from 'express';
// 💡 Importa as interfaces criadas em src/types.ts
// 👇 CORREÇÃO: Adicionando a extensão explícita '.js' para 'NodeNext'
import { StormGlassResponse, StormGlassErrorBody } from './types.js';


// 1. Configuração
const PORT = Number(process.env.PORT) || 8000;
const STORMGLASS_API_KEY = process.env.STORMGLASS_API_KEY;

// Verifica se a chave de API está definida
if (!STORMGLASS_API_KEY) {
    console.error("ERRO: Variável de ambiente STORMGLASS_API_KEY não está definida.");
    process.exit(1); // Encerra a aplicação se o segredo vital estiver faltando
}

const app = express();
app.use(express.json());

// 2. Endpoint Refatorado
app.get('/weatherforecast', async (req: Request, res: Response) => {
    
    // Define coordenadas padrão para São Paulo, caso não sejam fornecidas
    const lat = req.query.lat?.toString() || '-23.55'; // Latitude (São Paulo)
    const lng = req.query.lng?.toString() || '-46.63'; // Longitude (São Paulo)
    
    // Parâmetros que queremos da StormGlass: temperatura e cobertura de nuvens
    const params = [
        'airTemperature', 
        'cloudCover',
    ].join(',');
    
    const apiUrl = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${params}`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': STORMGLASS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // 👇 CORREÇÃO 1 (TS2322): Usa 'as' assertion para forçar a tipagem do corpo de erro
            const errorBody = await response.json() as StormGlassErrorBody;
            
            // Tratamento de erro robusto da API externa
            return res.status(response.status).json({
                error: `Erro ao acessar API externa (${response.status})`,
                details: errorBody.errors || errorBody,
            });
        }
        
        // 👇 CORREÇÃO 2 (TS2322): Usa 'as' assertion para forçar a tipagem dos dados de sucesso
        const data = await response.json() as StormGlassResponse;
        
        // Validação de segurança: Checa se há dados de hora
        if (!data.hours || data.hours.length === 0) {
            return res.status(404).json({
                error: 'Nenhum dado de previsão encontrado para as coordenadas.',
            });
        }
        
        // 3. Formatação da Resposta
        // 👇 CORREÇÃO 3 (TS18048): Usa o Operador de Não-Nulo '!' para garantir que data.hours[0] não é undefined
        // (Isso é seguro pois acabamos de checar que o array tem length > 0)
        const latestData = data.hours[0]!; 

        // 💡 Uso seguro de dados tipados.
        // As propriedades aninhadas são acessadas com segurança
        const tempC = latestData.airTemperature.sg ? latestData.airTemperature.sg.toFixed(1) : 'N/A';
        const cloudCover = latestData.cloudCover.sg ? latestData.cloudCover.sg.toFixed(0) : 'N/A';

        return res.json({
            latitude: lat,
            longitude: lng,
            timestamp: latestData.time,
            temperatureCelsius: tempC,
            cloudCoverPercent: cloudCover,
            source: 'StormGlass.io',
        });

    } catch (error) {
        // Erro de rede ou outro problema de execução do fetch
        console.error('Erro na requisição à StormGlass:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar dados meteorológicos.',
            // O uso de 'instanceof Error' ajuda na tipagem do objeto 'error'
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Endpoint de teste: http://localhost:${PORT}/weatherforecast`);
});
