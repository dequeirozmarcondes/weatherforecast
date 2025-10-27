import { app } from './app.js'; 
import { PORT, validateEnvironment } from './config.js'; 

/**
 * Função principal que inicializa o servidor.
 */
function startServer() {
    // 1. Valida as variáveis de ambiente antes de tudo
    validateEnvironment();

    // 2. Inicia o servidor Express
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`Endpoint de previsão: http://localhost:${PORT}/weatherforecast`);
    });
}

// Executa a função de inicialização
startServer();
