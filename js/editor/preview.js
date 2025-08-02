// preview.js - Funções de gerenciamento do preview

import { convertLinksToClickable } from './utils.js';
import { syncCheckboxToEditor } from './elements.js';

// Atualizar preview
export function updatePreview() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    const htmlContent = editor.innerHTML;
    const textContent = editor.textContent || editor.innerText;
    
    // Se o editor está vazio, limpar o preview também
    if (!textContent.trim() && !htmlContent.trim()) {
        preview.innerHTML = '';
        return;
    }
    
    // Salvar estados dos checkboxes do preview antes de atualizar
    const previewCheckboxStates = {};
    const existingPreviewCheckboxes = preview.querySelectorAll('input[type="checkbox"]');
    existingPreviewCheckboxes.forEach(checkbox => {
        if (checkbox.id) {
            previewCheckboxStates[checkbox.id] = checkbox.checked;
        }
    });
    
    // Salvar estados dos checkboxes do editor
    const editorCheckboxStates = {};
    const editorCheckboxes = editor.querySelectorAll('input[type="checkbox"]');
    editorCheckboxes.forEach(checkbox => {
        if (checkbox.id) {
            editorCheckboxStates[checkbox.id] = checkbox.checked;
        }
    });
    
    const htmlWithLinks = convertLinksToClickable(htmlContent);
    preview.innerHTML = htmlWithLinks;
    
    // Aplicar estados dos checkboxes no preview
    const newPreviewCheckboxes = preview.querySelectorAll('input[type="checkbox"]');
    newPreviewCheckboxes.forEach(checkbox => {
        if (checkbox.id) {
            // Priorizar estado do editor, depois do preview anterior
            if (editorCheckboxStates.hasOwnProperty(checkbox.id)) {
                checkbox.checked = editorCheckboxStates[checkbox.id];
            } else if (previewCheckboxStates.hasOwnProperty(checkbox.id)) {
                checkbox.checked = previewCheckboxStates[checkbox.id];
            }
        }
        
        // Adicionar listener para sincronizar com o editor
        checkbox.addEventListener('change', function() {
            syncCheckboxToEditor(this);
        });
    });
    
    // Sincronizar scroll
    preview.scrollTop = editor.scrollTop;
    preview.scrollLeft = editor.scrollLeft;
}

// Mostrar preview
export function showPreview() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    preview.style.display = 'block';
    // Manter cor do texto para o cursor ficar alinhado
    editor.style.color = 'transparent';
    editor.style.caretColor = '#0f0f0f'; // Cor ajustada para melhor visibilidade
}

// Esconder preview
export function hidePreview() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    preview.style.display = 'none';
    editor.style.color = '#0f0f0f';
}