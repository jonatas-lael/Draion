// formatting.js - Funções de formatação de texto

// Aplicar formatação apenas ao texto selecionado
export function applyFormattingToSelection(command, updatePreviewCallback) {
    const selection = window.getSelection();
    
    // Se não há seleção ou a seleção está vazia, não faz nada
    if (!selection.rangeCount || selection.isCollapsed) {
        return;
    }
    
    // Salvar a seleção atual
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText.length === 0) {
        return;
    }
    
    // Garantir que o editor tenha foco
    const editor = document.getElementById('editor');
    editor.focus();
    
    // Aplicar a formatação diretamente
    document.execCommand(command, false, null);
    
    // Atualizar preview após formatação
    setTimeout(() => {
        updatePreviewCallback();
        editor.focus();
    }, 10);
}

// Resetar formatação
export function resetFormatting() {
    // Remove todos os estados de formatação ativos
    if (document.queryCommandState('bold')) {
        document.execCommand('bold', false, null);
    }
    if (document.queryCommandState('italic')) {
        document.execCommand('italic', false, null);
    }
    if (document.queryCommandState('underline')) {
        document.execCommand('underline', false, null);
    }
    if (document.queryCommandState('strikethrough')) {
        document.execCommand('strikethrough', false, null);
    }
}

// Limpar seleção e resetar formatação
export function clearSelectionAndReset() {
    setTimeout(() => {
        try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                // Apenas colapsar a seleção atual sem tentar recriar ranges
                selection.collapseToEnd();
            }
            
            // Resetar qualquer formatação ativa
            resetFormatting();
        } catch (e) {
            console.error('Erro ao limpar seleção:', e);
            const editor = document.getElementById('editor');
            editor.focus();
        }
    }, 10);
}