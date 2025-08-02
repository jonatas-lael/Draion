// router.js - Gerenciamento de rotas e navegação

import { dbManager } from './database.js';
import { showEditor, showIndex } from './ui.js';

class Router {
    constructor() {
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Escutar mudanças na URL
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('load', () => this.handleRouteChange());
    }

    // Processar mudanças de rota
    async handleRouteChange() {
        const hash = window.location.hash;
        
        if (hash.startsWith('#/')) {
            const pageName = hash.substring(2); // Remove '#/'
            
            if (pageName) {
                await this.navigateToPage(pageName);
            } else {
                this.navigateToIndex();
            }
        } else {
            this.navigateToIndex();
        }
    }

    // Navegar para uma página específica
    async navigateToPage(pageName) {
        try {
            console.log(`Navegando para página: ${pageName}`);
            
            // Tentar criar/acessar a página no Firebase
            const pageData = await dbManager.createOrAccessPage(pageName);
            
            // Atualizar a URL se necessário
            const expectedHash = `#/${dbManager.getCurrentPageName()}`;
            if (window.location.hash !== expectedHash) {
                window.history.replaceState(null, null, expectedHash);
            }
            
            // Mostrar o editor
            showEditor(pageData);
            
            this.currentRoute = dbManager.getCurrentPageName();
            
        } catch (error) {
            console.error('Erro ao navegar para página:', error);
            // Em caso de erro, voltar para o index
            this.navigateToIndex();
        }
    }

    // Navegar para o index
    navigateToIndex() {
        console.log('Navegando para index');
        
        // Limpar hash da URL
        if (window.location.hash) {
            window.history.replaceState(null, null, window.location.pathname);
        }
        
        // Parar de escutar mudanças do Firebase
        dbManager.stopListening();
        
        // Mostrar index
        showIndex();
        
        this.currentRoute = null;
    }

    // Navegar programaticamente para uma página
    goToPage(pageName) {
        const sanitizedName = dbManager.sanitizePageName(pageName);
        window.location.hash = `#/${sanitizedName}`;
    }

    // Voltar para o index
    goToIndex() {
        window.location.hash = '';
    }

    // Obter rota atual
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Exportar instância única
export const router = new Router();