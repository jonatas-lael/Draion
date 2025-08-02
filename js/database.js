// database.js - Funções de interação com o Firebase

import { database } from './firebase-config.js';

class DatabaseManager {
    constructor() {
        this.currentPageName = null;
        this.pageRef = null;
    }

    // Obter data atual no formato brasileiro
    getCurrentBrazilianDate() {
        const now = new Date();
        
        const options = {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return now.toLocaleString('pt-BR', options);
    }
    // Sanitizar nome da página para usar como chave no Firebase
    sanitizePageName(pageName) {
        return pageName
            .toLowerCase()
            .trim()
            .replace(/[.#$[\]]/g, '') // Remove caracteres não permitidos pelo Firebase
            .replace(/\s+/g, '_') // Substitui espaços por underscore
            .replace(/[^a-zA-Z0-9_-]/g, ''); // Remove outros caracteres especiais
    }

    // Criar ou acessar uma página
    async createOrAccessPage(pageName) {
        try {
            const sanitizedName = this.sanitizePageName(pageName);
            
            if (!sanitizedName) {
                throw new Error('Nome da página inválido');
            }

            this.currentPageName = sanitizedName;
            this.pageRef = database.ref(`pages/${sanitizedName}`);

            console.log(`Acessando página: ${sanitizedName}`);

            // Verificar se a página já existe
            const snapshot = await this.pageRef.once('value');
            
            if (snapshot.exists()) {
                console.log('Página já existe, carregando dados...');
                const pageData = snapshot.val();
                
                console.log('Dados da página carregados:', {
                    nome: pageData.name,
                    criação: pageData.createdAt,
                    modificação: pageData.lastModified
                });
                
                return pageData;
            } else {
                console.log('Criando nova página...');
                const currentDate = this.getCurrentBrazilianDate();
                
                const initialData = {
                    name: pageName, // Nome original da página
                    content: '',
                    createdAt: currentDate,
                    lastModified: currentDate
                };
                
                await this.pageRef.set(initialData);
                
                console.log('Nova página criada:', {
                    nome: initialData.name,
                    criação: initialData.createdAt,
                    modificação: initialData.lastModified
                });
                
                return initialData;
            }
        } catch (error) {
            console.error('Erro ao criar/acessar página:', error);
            throw error;
        }
    }

    // Salvar conteúdo da página
    async savePageContent(content) {
        try {
            if (!this.pageRef) {
                throw new Error('Nenhuma página selecionada');
            }

            const currentDate = this.getCurrentBrazilianDate();
            
            const updateData = {
                content: content,
                lastModified: currentDate
            };

            await this.pageRef.update(updateData);

            console.log(`Conteúdo salvo em: ${currentDate}`);
        } catch (error) {
            console.error('Erro ao salvar conteúdo:', error);
            throw error;
        }
    }

    // Escutar mudanças na página em tempo real
    listenToPageChanges(callback) {
        if (!this.pageRef) {
            console.error('Nenhuma página selecionada para escutar mudanças');
            return null;
        }

        return this.pageRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const pageData = snapshot.val();
                callback(pageData);
            }
        });
    }

    // Parar de escutar mudanças
    stopListening() {
        if (this.pageRef) {
            this.pageRef.off();
        }
    }

    // Obter nome da página atual
    getCurrentPageName() {
        return this.currentPageName;
    }

    // Verificar se uma página existe
    async pageExists(pageName) {
        try {
            const sanitizedName = this.sanitizePageName(pageName);
            const snapshot = await database.ref(`pages/${sanitizedName}`).once('value');
            return snapshot.exists();
        } catch (error) {
            console.error('Erro ao verificar se página existe:', error);
            return false;
        }
    }

    // Listar todas as páginas (para uso futuro)
    async getAllPages() {
        try {
            const snapshot = await database.ref('pages').once('value');
            return snapshot.val() || {};
        } catch (error) {
            console.error('Erro ao listar páginas:', error);
            return {};
        }
    }
}

// Exportar instância única
export const dbManager = new DatabaseManager();