import 'dotenv/config';

// Define a porta do servidor
export const PORT = Number(process.env.PORT) || 8000;

// Obtém a chave da API StormGlass
export const STORMGLASS_API_KEY = process.env.STORMGLASS_API_KEY;

/**
 * Valida as variáveis de ambiente essenciais.
 * Encerra o processo se a chave da API StormGlass não estiver definida.
 */
export function validateEnvironment(): void {
    if (!STORMGLASS_API_KEY) {
        console.error("ERRO: Variável de ambiente STORMGLASS_API_KEY não está definida.");
        process.exit(1);
    }
    console.log(`Configuração carregada. Porta: ${PORT}`);
}
