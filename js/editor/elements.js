// elements.js - Funções para inserção de elementos especiais

// Inserir checkbox
export function insertCheckbox(updatePreviewCallback) {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'checkbox_' + Date.now();
        
        // Adicionar listener para o checkbox do editor
        checkbox.addEventListener('change', function() {
            const preview = document.getElementById('preview');
            const previewCheckbox = preview.querySelector(`input[type="checkbox"]#${this.id}`);
            if (previewCheckbox) {
                previewCheckbox.checked = this.checked;
            }
            
            // Trigger auto-save quando checkbox muda de estado
            triggerAutoSave();
        });
        
        const space = document.createTextNode('  '); // Espaço duplo para melhor alinhamento
        
        // Inserir checkbox primeiro, depois o espaço
        range.insertNode(space);
        range.insertNode(checkbox);
        
        // Posicionar cursor APÓS o espaço
        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Atualizar preview
        updatePreviewCallback();
    } catch (e) {
        console.error('Erro em insertCheckbox:', e);
    }
}

// Inserir divisória
export function insertDivider(updatePreviewCallback, getTextBeforeCursor) {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        
        // Verificar se há texto na linha atual antes do cursor
        const textBefore = getTextBeforeCursor(range);
        const lines = textBefore.split('\n');
        const currentLine = lines[lines.length - 1];
        const hasTextInCurrentLine = currentLine.trim().length > 0;
        
        // Criar a linha divisória
        const divider = document.createElement('hr');
        divider.className = 'divider-line';
        
        // Criar quebras de linha apenas quando necessário
        const elements = [];
        
        // Se há texto na linha atual, adicionar uma quebra antes da divisória
        if (hasTextInCurrentLine) {
            elements.push(document.createElement('br'));
        }
        
        // Adicionar a divisória
        elements.push(divider);
        
        // Adicionar apenas uma quebra após a divisória
        elements.push(document.createElement('br'));
        
        // Inserir todos os elementos na ordem reversa
        for (let i = elements.length - 1; i >= 0; i--) {
            range.insertNode(elements[i]);
        }
        
        // Posicionar cursor na linha após a divisória
        const newRange = document.createRange();
        newRange.setStartAfter(elements[elements.length - 1]);
        newRange.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Atualizar preview
        updatePreviewCallback();
    } catch (e) {
        console.error('Erro em insertDivider:', e);
    }
}

// Sincronizar checkbox do preview com o editor
export function syncCheckboxToEditor(previewCheckbox) {
    try {
        const checkboxId = previewCheckbox.id;
        const editor = document.getElementById('editor');
        const editorCheckbox = editor.querySelector(`input[type="checkbox"]#${checkboxId}`);
        
        if (editorCheckbox) {
            editorCheckbox.checked = previewCheckbox.checked;
            
            // Trigger auto-save quando checkbox é sincronizado
            triggerAutoSave();
        }
    } catch (e) {
        console.error('Erro ao sincronizar checkbox:', e);
    }
}

// Função para triggerar auto-save
function triggerAutoSave() {
    // Disparar evento customizado para que o UI Manager saiba que precisa salvar
    const autoSaveEvent = new CustomEvent('triggerAutoSave');
    document.dispatchEvent(autoSaveEvent);
}

// Configurar listeners para checkboxes existentes (quando carrega uma página)
export function setupExistingCheckboxes() {
    try {
        const editor = document.getElementById('editor');
        const checkboxes = editor.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            // Remover listeners existentes para evitar duplicação
            checkbox.removeEventListener('change', handleCheckboxChange);
            
            // Adicionar novo listener
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        console.log(`Configurados listeners para ${checkboxes.length} checkboxes existentes`);
    } catch (e) {
        console.error('Erro ao configurar checkboxes existentes:', e);
    }
}

// Handler para mudanças em checkbox
function handleCheckboxChange(event) {
    const checkbox = event.target;
    
    // Sincronizar com preview
    const preview = document.getElementById('preview');
    const previewCheckbox = preview.querySelector(`input[type="checkbox"]#${checkbox.id}`);
    if (previewCheckbox) {
        previewCheckbox.checked = checkbox.checked;
    }
    
    // Trigger auto-save
    triggerAutoSave();
}