// utils.js - Funções utilitárias e constantes

// Regex para detectar URLs
export const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+|(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`[\]]*)?)/gi;

// Converter links para clicáveis
export function convertLinksToClickable(text) {
    return text.replace(urlRegex, (match) => {
        let href = match;
        // Se não tem protocolo, adiciona https://
        if (!match.match(/^https?:\/\//)) {
            href = 'https://' + match;
        }
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
}

// Obter texto antes do cursor
export function getTextBeforeCursor(range) {
    try {
        const container = range.startContainer;
        let text = '';
        
        if (container.nodeType === Node.TEXT_NODE) {
            const offset = Math.min(range.startOffset, container.textContent.length);
            text = container.textContent.substring(0, offset);
            
            // Percorrer nós anteriores no mesmo elemento pai
            let node = container.previousSibling;
            while (node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text = node.textContent + text;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    text = node.textContent + text;
                }
                node = node.previousSibling;
            }
        }
        
        return text;
    } catch (e) {
        console.error('Erro em getTextBeforeCursor:', e);
        return '';
    }
}

// Substituir último texto
export function replaceLastText(oldText, newText) {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        if (container.nodeType !== Node.TEXT_NODE) return;
        
        const currentText = container.textContent;
        const startOffset = range.startOffset;
        
        // Verificar se há texto suficiente para substituir
        if (startOffset < oldText.length) return;
        
        const replaceStart = startOffset - oldText.length;
        const textToReplace = currentText.substring(replaceStart, startOffset);
        
        if (textToReplace === oldText) {
            // Criar range seguro
            const replaceRange = document.createRange();
            replaceRange.setStart(container, replaceStart);
            replaceRange.setEnd(container, startOffset);
            
            // Substituir
            replaceRange.deleteContents();
            if (newText) {
                const textNode = document.createTextNode(newText);
                replaceRange.insertNode(textNode);
                
                // Posicionar cursor APÓS o novo texto
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // Se newText é vazio, posicionar cursor no local da remoção
                const newRange = document.createRange();
                newRange.setStart(container, replaceStart);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    } catch (e) {
        console.error('Erro em replaceLastText:', e);
    }
}

// Substituir última palavra
export function replaceLastWord(word, replacement) {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        if (container.nodeType !== Node.TEXT_NODE) return;
        
        const currentText = container.textContent;
        const startOffset = range.startOffset;
        
        // Verificar se há texto suficiente
        if (startOffset < word.length) return;
        
        const replaceStart = startOffset - word.length;
        const textToReplace = currentText.substring(replaceStart, startOffset);
        
        if (textToReplace === word) {
            // Criar range seguro
            const replaceRange = document.createRange();
            replaceRange.setStart(container, replaceStart);
            replaceRange.setEnd(container, startOffset);
            
            // Substituir
            replaceRange.deleteContents();
            if (replacement) {
                const textNode = document.createTextNode(replacement);
                replaceRange.insertNode(textNode);
                
                // Posicionar cursor APÓS o texto de substituição
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    } catch (e) {
        console.error('Erro em replaceLastWord:', e);
    }
}

// Converter timestamp para data brasileira
export function formatBrazilianDate(timestamp) {
    if (!timestamp) return 'Data não disponível';
    
    try {
        const date = new Date(timestamp);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        
        // Formatação para o padrão brasileiro
        const options = {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        
        return date.toLocaleString('pt-BR', options);
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Erro na formatação';
    }
}

// Converter timestamp para data brasileira mais legível
export function formatBrazilianDateReadable(timestamp) {
    if (!timestamp) return 'Data não disponível';
    
    try {
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Se foi hoje
        if (diffDays <= 1 && date.getDate() === now.getDate()) {
            return `Hoje às ${date.toLocaleTimeString('pt-BR', { 
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // Se foi ontem
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.getDate() === yesterday.getDate() && 
            date.getMonth() === yesterday.getMonth() && 
            date.getFullYear() === yesterday.getFullYear()) {
            return `Ontem às ${date.toLocaleTimeString('pt-BR', { 
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit', 
                minute: '2-digit' 
            })}`;
        }
        
        // Para outras datas
        return date.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data legível:', error);
        return 'Erro na formatação';
    }
}