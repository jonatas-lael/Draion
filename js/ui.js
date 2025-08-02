// ui.js - Gerenciamento da interface do usuário

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
            }, 500); // 500ms para checkboxes vs 2000ms para texto
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
                this.editor.innerHTML = pageData.content;
                
                // Configurar listeners para checkboxes existentes
                setTimeout(() => {
                    setupExistingCheckboxes();
                }, 100);
                
                updatePreview();
            } else {
                this.editor.innerHTML = '';
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

            // Configurar auto-save
            this.setupAutoSave();
            
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

    // Configurar salvamento automático
    setupAutoSave() {
        // Remover listeners anteriores se existirem
        this.editor.removeEventListener('input', this.handleAutoSave);
        
        // Adicionar novo listener
        this.handleAutoSave = () => {
            // Debounce: salvar após 2 segundos de inatividade
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveContent();
            }, 2000);
        };

        this.editor.addEventListener('input', this.handleAutoSave);
    }

    // Salvar conteúdo no Firebase (incluindo estado dos checkboxes)
    async saveContent() {
        try {
            // Capturar o HTML atual com o estado dos checkboxes
            const content = this.getContentWithCheckboxStates();
            await dbManager.savePageContent(content);
            console.log('Conteúdo auto-salvo (incluindo estado dos checkboxes)');
        } catch (error) {
            console.error('Erro no auto-save:', error);
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

    // Configurar listener para mudanças em tempo real
    setupRealtimeListener() {
        dbManager.listenToPageChanges((pageData) => {
            // Atualizar conteúdo apenas se for diferente do atual
            const currentContent = this.getContentWithCheckboxStates();
            if (pageData.content && pageData.content !== currentContent) {
                // Preservar posição do cursor se possível
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                
                this.editor.innerHTML = pageData.content;
                
                // Configurar listeners para checkboxes após atualizar conteúdo
                setTimeout(() => {
                    setupExistingCheckboxes();
                }, 100);
                
                updatePreview();
                
                // Tentar restaurar posição do cursor
                if (range) {
                    try {
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } catch (e) {
                        // Se não conseguir restaurar, posicionar no final
                        this.setCursorToEnd();
                    }
                } else {
                    // Se não havia seleção anterior, posicionar no final
                    this.setCursorToEnd();
                }
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
        
        if (this.editor && this.handleAutoSave) {
            this.editor.removeEventListener('input', this.handleAutoSave);
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