// events.js - Configuração de todos os event listeners

import { resetFormatting } from './formatting.js';
import { showPreview, updatePreview } from './preview.js';

// Configurar todos os event listeners
export function setupEventListeners(updatePreviewCallback) {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');

    // Scroll sincronizado
    editor.addEventListener('scroll', () => {
        preview.scrollTop = editor.scrollTop;
        preview.scrollLeft = editor.scrollLeft;
    });

    // Resetar formatação quando o usuário clica em uma nova posição
    editor.addEventListener('click', function(e) {
        setTimeout(() => {
            resetFormatting();
            updatePreviewCallback(); // Garantir que o preview esteja sincronizado
        }, 10);
    });

    // Foco no editor
    editor.addEventListener('focus', function() {
        showPreview();
        updatePreviewCallback();
    });

    // Adicionar listener para mudanças do DOM no editor
    const observer = new MutationObserver(function(mutations) {
        // Verificar se a mutação não foi causada por sincronização de checkbox
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && 
                mutation.target.type === 'checkbox' && 
                mutation.attributeName === 'checked') {
                // Não atualizar preview para mudanças de checkbox
                return;
            } else {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            updatePreviewCallback();
        }
    });

    observer.observe(editor, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['checked']
    });

    // Detectar clique em links
    preview.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            window.open(e.target.href, '_blank', 'noopener,noreferrer');
        }
    });

    // Auto-foco no editor quando a página carrega
    window.addEventListener('load', function() {
        editor.focus();
    });

    // Garantir foco também quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        editor.focus();
    });
}