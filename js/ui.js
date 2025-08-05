// ui.js - Gerenciamento da interface do usuário (Versão Colaborativa)

import { dbManager } from './database.js';
import { updatePreview } from './editor/preview.js';
import { setupExistingCheckboxes } from './editor/elements.js';

class UIManager {
    constructor() {
        this.indexSection = null;
        this.editorSection = null;
        this.editor = null;
        this.isInitialized = false;
        this.saveTimeout = null;
        this.checkboxSaveTimeout = null;
        
        // Controle de colaboração
        this.isReceivingRemoteUpdate = false;
        this.lastLocalContent = '';
        this.collaborativeUpdateTimeout = null;
        this.lastCursorPosition = null;
    }

    init() {
        if (this.isInitialized) return;

        this.indexSection = document.getElementById('indexSection');
        this.editorSection = document.getElementById('editorSection');
        this.editor = document.getElementById('editor');

        if (!this.indexSection || !this.editorSection || !this.editor) {
            console.error('Elementos da UI não encontrados');
            return;
        }

        // Configurar listener para auto-save de checkboxes
        this.setupCheckboxAutoSave();

        this.isInitialized = true;
        console.log('UI Manager inicializado');
    }

    // Configurar auto-save para checkboxes
    setupCheckboxAutoSave() {
        document.addEventListener('triggerAutoSave', () => {
            // Debounce específico para checkboxes (mais rápido que o texto)
            clearTimeout(this.checkboxSaveTimeout);
            this.checkboxSaveTimeout = setTimeout(() => {
                this.saveContent();
            }, 300); // Ainda mais rápido para colaboração
        });
    }

    // Mostrar seção index com animação
    showIndex() {
        if (!this.isInitialized) this.init();

        this.editorSection.style.display = 'none';
        this.indexSection.style.display = 'flex';
        
        // Animação fade-in
        this.indexSection.style.opacity = '0';
        setTimeout(() => {
            this.indexSection.style.transition = 'opacity 0.5s ease-in-out';
            this.indexSection.style.opacity = '1';
        }, 10);

        console.log('Mostrando index');
    }

    // Mostrar seção editor com animação
    showEditor(pageData = null) {
        if (!this.isInitialized) this.init();

        // Fade-out do index
        this.indexSection.style.transition = 'opacity 0.5s ease-in-out';
        this.indexSection.style.opacity = '0';

        setTimeout(() => {
            this.indexSection.style.display = 'none';
            this.editorSection.style.display = 'block';
            
            // Carregar conteúdo se fornecido
            if (pageData && pageData.content) {
                this.isReceivingRemoteUpdate = true; // Evitar loop
                this.editor.innerHTML = pageData.content;
                this.lastLocalContent = this.getContentWithCheckboxStates();
                
                // Configurar listeners para checkboxes existentes
                setTimeout(() => {
                    setupExistingCheckboxes();
                    this.isReceivingRemoteUpdate = false;
                }, 100);
                
                updatePreview();
            } else {
                this.editor.innerHTML = '';
                this.lastLocalContent = '';
            }

            // Fade-in do editor
            this.editorSection.style.opacity = '0';
            this.editorSection.style.transition = 'opacity 0.5s ease-in-out';
            
            setTimeout(() => {
                this.editorSection.style.opacity = '1';
                this.editor.focus();
                
                // Posicionar cursor no final do conteúdo
                this.setCursorToEnd();
            }, 50);

            // Configurar auto-save colaborativo
            this.setupCollaborativeAutoSave();
            
            // Escutar mudanças em tempo real
            this.setupRealtimeListener();

        }, 300);

        console.log('Mostrando editor');
    }

    // Posicionar cursor no final do conteúdo
    setCursorToEnd() {
        try {
            const editor = this.editor;
            
            // Se o editor está vazio, não há necessidade de posicionar
            if (!editor.innerHTML.trim()) {
                return;
            }

            // Criar um range e posicioná-lo no final
            const range = document.createRange();
            const selection = window.getSelection();
            
            // Selecionar todo o conteúdo do editor
            range.selectNodeContents(editor);
            
            // Colapsar o range para o final (posição do cursor)
            range.collapse(false);
            
            // Limpar seleções existentes e aplicar a nova
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Garantir que o editor tenha foco
            editor.focus();
            
            console.log('Cursor posicionado no final do conteúdo');
        } catch (error) {
            console.error('Erro ao posicionar cursor no final:', error);
            // Fallback: apenas focar no editor
            this.editor.focus();
        }
    }

    // Salvar posição do cursor
    saveCursorPosition() {
        try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                this.lastCursorPosition = {
                    startContainer: range.startContainer,
                    startOffset: range.startOffset,
                    endContainer: range.endContainer,
                    endOffset: range.endOffset
                };
            }
        } catch (error) {
            console.error('Erro ao salvar posição do cursor:', error);
            this.lastCursorPosition = null;
        }
    }

    // Restaurar posição do cursor
    restoreCursorPosition() {
        try {
            if (!this.lastCursorPosition) return false;

            const selection = window.getSelection();
            const range = document.createRange();
            
            // Verificar se os containers ainda existem no DOM
            if (!document.contains(this.lastCursorPosition.startContainer) ||
                !document.contains(this.lastCursorPosition.endContainer)) {
                return false;
            }

            range.setStart(this.lastCursorPosition.startContainer, this.lastCursorPosition.startOffset);
            range.setEnd(this.lastCursorPosition.endContainer, this.lastCursorPosition.endOffset);
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            return true;
        } catch (error) {
            console.error('Erro ao restaurar posição do cursor:', error);
            return false;
        }
    }

    // Configurar salvamento automático colaborativo (mais agressivo)
    setupCollaborativeAutoSave() {
        // Remover listeners anteriores se existirem
        this.editor.removeEventListener('input', this.handleCollaborativeAutoSave);
        
        // Listener mais agressivo para colaboração
        this.handleCollaborativeAutoSave = () => {
            if (this.isReceivingRemoteUpdate) return; // Não salvar durante atualizações remotas
            
            // Salvar posição do cursor
            this.saveCursorPosition();
            
            // Auto-save mais rápido para colaboração
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveContent();
            }, 800); // 800ms ao invés de 2000ms
        };

        this.editor.addEventListener('input', this.handleCollaborativeAutoSave);

        // Listener adicional para mudanças de cursor/seleção
        this.editor.addEventListener('selectionchange', () => {
            if (!this.isReceivingRemoteUpdate) {
                this.saveCursorPosition();
            }
        });
    }

    // Salvar conteúdo no Firebase (incluindo estado dos checkboxes)
    async saveContent() {
        try {
            if (this.isReceivingRemoteUpdate) return; // Não salvar durante atualizações remotas
            
            // Capturar o HTML atual com o estado dos checkboxes
            const content = this.getContentWithCheckboxStates();
            
            // Só salvar se houve mudança real
            if (content !== this.lastLocalContent) {
                await dbManager.savePageContent(content);
                this.lastLocalContent = content;
                console.log('Conteúdo colaborativo salvo');
            }
        } catch (error) {
            console.error('Erro no auto-save colaborativo:', error);
        }
    }

    // Obter conteúdo com estado atual dos checkboxes
    getContentWithCheckboxStates() {
        // Clonar o conteúdo do editor
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.editor.innerHTML;
        
        // Atualizar estado dos checkboxes no clone
        const editorCheckboxes = this.editor.querySelectorAll('input[type="checkbox"]');
        const tempCheckboxes = tempDiv.querySelectorAll('input[type="checkbox"]');
        
        editorCheckboxes.forEach((editorCheckbox, index) => {
            if (tempCheckboxes[index]) {
                if (editorCheckbox.checked) {
                    tempCheckboxes[index].setAttribute('checked', 'checked');
                } else {
                    tempCheckboxes[index].removeAttribute('checked');
                }
            }
        });
        
        return tempDiv.innerHTML;
    }

    // Configurar listener para mudanças em tempo real (colaborativo)
    setupRealtimeListener() {
        dbManager.listenToPageChanges((pageData) => {
            // Evitar loops infinitos
            if (this.isReceivingRemoteUpdate) return;
            
            const remoteContent = pageData.content || '';
            const currentLocalContent = this.getContentWithCheckboxStates();
            
            // Só atualizar se o conteúdo remoto é diferente do local
            if (remoteContent !== currentLocalContent && remoteContent !== this.lastLocalContent) {
                console.log('Recebendo atualização colaborativa...');
                
                this.isReceivingRemoteUpdate = true;
                
                // Salvar posição do cursor antes da atualização
                this.saveCursorPosition();
                
                // Atualizar conteúdo
                this.editor.innerHTML = remoteContent;
                
                // Configurar listeners para checkboxes
                setTimeout(() => {
                    setupExistingCheckboxes();
                }, 50);
                
                // Atualizar preview
                updatePreview();
                
                // Tentar restaurar posição do cursor
                setTimeout(() => {
                    const restored = this.restoreCursorPosition();
                    if (!restored) {
                        // Se não conseguiu restaurar, manter foco no editor
                        this.editor.focus();
                    }
                    
                    // Atualizar controle local
                    this.lastLocalContent = remoteContent;
                    this.isReceivingRemoteUpdate = false;
                    
                    console.log('Atualização colaborativa aplicada');
                }, 100);
            }
        });
    }

    // Obter referências dos elementos
    getElements() {
        return {
            indexSection: this.indexSection,
            editorSection: this.editorSection,
            editor: this.editor
        };
    }

    // Limpar timeouts e listeners
    cleanup() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        if (this.checkboxSaveTimeout) {
            clearTimeout(this.checkboxSaveTimeout);
        }
        
        if (this.collaborativeUpdateTimeout) {
            clearTimeout(this.collaborativeUpdateTimeout);
        }
        
        if (this.editor && this.handleCollaborativeAutoSave) {
            this.editor.removeEventListener('input', this.handleCollaborativeAutoSave);
        }
        
        dbManager.stopListening();
    }
}

// Criar instância única
const uiManager = new UIManager();

// Exportar funções públicas
export const showIndex = () => uiManager.showIndex();
export const showEditor = (pageData) => uiManager.showEditor(pageData);
export const initUI = () => uiManager.init();
export const cleanupUI = () => uiManager.cleanup();