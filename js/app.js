// app.js - Controlador principal da aplicação

import { router } from './router.js';
import { initUI } from './ui.js';

class App {
    constructor() {
        this.isInitialized = false;
    }

    // Inicializar aplicação
    init() {
        if (this.isInitialized) return;

        console.log('Inicializando aplicação Draion...');

        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    // Iniciar aplicação
    start() {
        try {
            // Inicializar UI
            initUI();

            // Configurar event listeners do index
            this.setupIndexEvents();

            // O router já foi inicializado na importação
            // e está escutando mudanças de hash

            this.isInitialized = true;
            console.log('Aplicação Draion inicializada com sucesso');

        } catch (error) {
            console.error('Erro ao initializar aplicação:', error);
        }
    }

    // Configurar eventos da página inicial
    setupIndexEvents() {
        const pageNameInput = document.getElementById('pageNameInput');
        const accessButton = document.getElementById('accessButton');

        if (!pageNameInput || !accessButton) {
            console.error('Elementos do index não encontrados');
            return;
        }

        // Event listener para o botão de acesso
        accessButton.addEventListener('click', () => {
            this.handlePageAccess();
        });

        // Event listener para Enter no input
        pageNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePageAccess();
            }
        });

        // Auto-focus no input quando na página inicial
        if (window.location.hash === '' || window.location.hash === '#') {
            setTimeout(() => pageNameInput.focus(), 100);
        }
    }

    // Processar acesso à página
    handlePageAccess() {
        const pageNameInput = document.getElementById('pageNameInput');
        const pageName = pageNameInput.value.trim();

        if (!pageName) {
            this.showInputError('Por favor, digite o nome da página');
            return;
        }

        if (pageName.length < 2) {
            this.showInputError('O nome da página deve ter pelo menos 2 caracteres');
            return;
        }

        if (pageName.length > 50) {
            this.showInputError('O nome da página deve ter no máximo 50 caracteres');
            return;
        }

        // Navegar para a página
        router.goToPage(pageName);

        // Limpar input
        pageNameInput.value = '';
    }

    // Mostrar erro no input
    showInputError(message) {
        const pageNameInput = document.getElementById('pageNameInput');
        
        // Adicionar classe de erro (você pode criar esta classe no CSS)
        pageNameInput.classList.add('input-error');
        
        // Mostrar mensagem (você pode implementar um sistema de notificações)
        console.warn(message);
        
        // Remover classe de erro após alguns segundos
        setTimeout(() => {
            pageNameInput.classList.remove('input-error');
        }, 3000);

        // Focar no input
        pageNameInput.focus();
        pageNameInput.select();
    }

    // Obter instância do router
    getRouter() {
        return router;
    }
}

// Criar e exportar instância única
export const app = new App();