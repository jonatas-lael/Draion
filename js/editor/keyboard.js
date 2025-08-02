// keyboard.js - Manipuladores de eventos de teclado

import { applyFormattingToSelection, clearSelectionAndReset } from './formatting.js';
import { getTextBeforeCursor, replaceLastWord, replaceLastText } from './utils.js';
import { insertCheckbox, insertDivider } from './elements.js';

// Configurar listeners de teclado
export function setupKeyboardEvents(updatePreviewCallback) {
    const editor = document.getElementById('editor');

    // Formatações de texto com atalhos
    editor.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + B - Negrito
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('bold', updatePreviewCallback);
            return;
        }
        
        // Ctrl/Cmd + I - Itálico
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('italic', updatePreviewCallback);
            return;
        }
        
        // Ctrl/Cmd + U - Sublinhado
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('underline', updatePreviewCallback);
            return;
        }
        
        // Ctrl/Cmd + Shift + S - Tachado
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            e.stopPropagation();
            applyFormattingToSelection('strikethrough', updatePreviewCallback);
            return;
        }

        // Escape para limpar seleção e resetar formatação
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            clearSelectionAndReset();
            return;
        }

        // Espaço para comandos especiais
        if (e.key === ' ') {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            const textBefore = getTextBeforeCursor(range);
            const words = textBefore.split(/\s+/);
            const lastWord = words[words.length - 1];
            
            if (lastWord === '/check') {
                e.preventDefault();
                replaceLastWord('/check', '');
                insertCheckbox(updatePreviewCallback);
                return;
            }
            
            // Comando para lista não ordenada
            if (lastWord === '/ul') {
                e.preventDefault();
                replaceLastWord('/ul', '• ');
                return;
            }
            
            // Comando para lista ordenada
            if (lastWord === '/ol') {
                e.preventDefault();
                replaceLastWord('/ol', '1. ');
                return;
            }
            
            if (lastWord === '/div') {
                e.preventDefault();
                replaceLastWord('/div', '');
                insertDivider(updatePreviewCallback, getTextBeforeCursor);
                return;
            }
        }

        // Auto-continuação de listas ao pressionar Enter
        if (e.key === 'Enter' && !e.shiftKey && !(e.ctrlKey || e.metaKey)) {
            setTimeout(() => {
                try {
                    const selection = window.getSelection();
                    if (selection.rangeCount === 0) return;
                    
                    const range = selection.getRangeAt(0);
                    const textBefore = getTextBeforeCursor(range);
                    
                    if (!textBefore) return;
                    
                    const lines = textBefore.split('\n');
                    
                    if (lines.length >= 2) {
                        const prevLine = lines[lines.length - 2].trim();
                        
                        // Auto-bullet para listas não ordenadas
                        if (prevLine.startsWith('• ')) {
                            const textNode = document.createTextNode('• ');
                            range.insertNode(textNode);
                            
                            // Posicionar cursor APÓS o bullet
                            const newRange = document.createRange();
                            newRange.setStartAfter(textNode);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                            
                            // Atualizar preview
                            updatePreviewCallback();
                            return;
                        }
                        
                        // Auto-numeração para listas ordenadas
                        const numMatch = prevLine.match(/^(\d+)\.\s/);
                        if (numMatch) {
                            const nextNum = parseInt(numMatch[1]) + 1;
                            const newText = `${nextNum}. `;
                            const textNode = document.createTextNode(newText);
                            range.insertNode(textNode);
                            
                            // Posicionar cursor APÓS o número
                            const newRange = document.createRange();
                            newRange.setStartAfter(textNode);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                            
                            // Atualizar preview
                            updatePreviewCallback();
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Erro na auto-continuação de lista:', e);
                }
            }, 10);
        }
    });
}

// Configurar eventos de input
export function setupInputEvents(updatePreviewCallback) {
    const editor = document.getElementById('editor');

    editor.addEventListener('input', function(e) {
        try {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            const textBefore = getTextBeforeCursor(range);
            
            if (!textBefore) return;
            
            // Lista com marcadores (- + espaço) - convertendo para bullet
            if (textBefore.endsWith('- ')) {
                replaceLastText('- ', '• ');
                setTimeout(() => updatePreviewCallback(), 0);
                return;
            }
            
            // Checkbox ([] + espaço)
            if (textBefore.endsWith('[] ')) {
                replaceLastText('[] ', '');
                setTimeout(() => insertCheckbox(updatePreviewCallback), 0);
                return;
            }
            
            // Linha divisória (---)
            if (textBefore.endsWith('---')) {
                // Verificar se --- está no final do texto ou após conteúdo
                const lines = textBefore.split('\n');
                const currentLine = lines[lines.length - 1];
                
                if (currentLine.endsWith('---')) {
                    replaceLastText('---', '');
                    setTimeout(() => insertDivider(updatePreviewCallback, getTextBeforeCursor), 0);
                    return;
                }
            }
        } catch (e) {
            console.error('Erro no input handler:', e);
        }
        
        // Sempre atualizar o preview, incluindo quando o conteúdo é deletado
        setTimeout(() => updatePreviewCallback(), 0);
    });

    // Listener adicional para detectar mudanças no conteúdo (incluindo delete/backspace)
    editor.addEventListener('keyup', function(e) {
        // Atualizar preview em operações de delete
        if (e.key === 'Backspace' || e.key === 'Delete') {
            updatePreviewCallback();
        }
    });
}