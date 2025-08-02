// main.js - Arquivo principal que inicializa toda a aplicação

import { updatePreview, showPreview } from './editor/preview.js';
import { setupKeyboardEvents, setupInputEvents } from './editor/keyboard.js';
import { setupEventListeners } from './editor/events.js';
import { app } from './app.js';

// Função principal de inicialização do editor
function initializeEditor() {
    // Configurar todos os event listeners do editor
    setupKeyboardEvents(updatePreview);
    setupInputEvents(updatePreview);
    setupEventListeners(updatePreview);
    
    // Inicializar - mostrar preview sempre
    showPreview();
    updatePreview();
    
    console.log('Editor inicializado');
}

// Inicializar aplicação principal
function initializeApp() {
    // Inicializar app principal (Firebase, Router, UI)
    app.init();
    
    // Inicializar editor quando necessário
    // O editor será inicializado quando o usuário acessar uma página
    setTimeout(() => {
        initializeEditor();
    }, 100);
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Exportar funções principais para uso global se necessário
window.DraionApp = {
    app: app,
    initializeEditor: initializeEditor
};