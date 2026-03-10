/**
 * YouTube Music Kawarp Plugin
 * Renderizador de fundos animados fluidos usando WebGL, Kawase blur e domain warping
 * Baseado em: https://github.com/better-lyrics/kawarp
 */

import style from './style.css?inline';
import { createPlugin } from '@/utils';
import { waitForElement } from '@/utils/wait-for-element';
import { menu } from './menu';
import type { KawarpPluginConfig, RendererState } from './types';

// Importar Kawarp dinamicamente
let Kawarp: any;

const defaultConfig: KawarpPluginConfig = {
  warpIntensity: 0.6,
  blurPasses: 8,
  animationSpeed: 1.0,
  transitionDuration: 800,
  saturation: 1.5,
  enabled: true,
};

const state: RendererState = {
  kawarp: null,
  canvas: null,
  container: null,
  currentImageUrl: null,
  isTransitioning: false,
};

/**
 * Extrai a URL da imagem do álbum a partir do elemento do player
 */
function getAlbumImageUrl(): string | null {
  try {
    // Procura pela imagem do álbum no player
    const albumImage = document.querySelector(
      'img[alt="Album art"]'
    ) as HTMLImageElement;

    if (albumImage && albumImage.src) {
      return albumImage.src;
    }

    // Alternativa: procura por imagens no container do player
    const playerContainer = document.querySelector('[data-testid="player"]');
    if (playerContainer) {
      const img = playerContainer.querySelector('img') as HTMLImageElement;
      if (img && img.src) {
        return img.src;
      }
    }

    return null;
  } catch (error) {
    console.error('[Kawarp] Erro ao extrair URL da imagem:', error);
    return null;
  }
}

/**
 * Carrega a biblioteca Kawarp dinamicamente
 */
async function loadKawarpLibrary(): Promise<void> {
  if (Kawarp) return;

  try {
    // Carregar a biblioteca do CDN
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@kawarp/core@latest/dist/index.umd.js';
    script.async = true;

    await new Promise((resolve, reject) => {
      script.onload = () => {
        // Kawarp é exposto globalmente como window.Kawarp
        Kawarp = (window as any).Kawarp;
        if (!Kawarp) {
          reject(new Error('Kawarp não foi carregado corretamente'));
        } else {
          resolve(undefined);
        }
      };
      script.onerror = () => reject(new Error('Falha ao carregar Kawarp'));
      document.head.appendChild(script);
    });

    console.log('[Kawarp] Biblioteca carregada com sucesso');
  } catch (error) {
    console.error('[Kawarp] Erro ao carregar biblioteca:', error);
    throw error;
  }
}

/**
 * Cria o container e canvas para o Kawarp
 */
function createKawarpContainer(): HTMLCanvasElement {
  // Remover container anterior se existir
  const existing = document.querySelector('.ytm-kawarp-container');
  if (existing) {
    existing.remove();
  }

  // Criar container
  const container = document.createElement('div');
  container.className = 'ytm-kawarp-container';

  // Criar canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'ytm-kawarp-canvas';

  container.appendChild(canvas);
  document.body.insertBefore(container, document.body.firstChild);

  state.container = container;
  return canvas;
}

/**
 * Inicializa a instância do Kawarp
 */
async function initializeKawarp(canvas: HTMLCanvasElement): Promise<void> {
  try {
    // Criar instância do Kawarp
    const kawarp = new Kawarp.Kawarp(canvas);

    // Aplicar configurações
    kawarp.warpIntensity = defaultConfig.warpIntensity;
    kawarp.blurPasses = defaultConfig.blurPasses;
    kawarp.animationSpeed = defaultConfig.animationSpeed;
    kawarp.saturation = defaultConfig.saturation;

    state.kawarp = kawarp;

    // Carregar imagem inicial
    const imageUrl = getAlbumImageUrl();
    if (imageUrl) {
      await kawarp.loadImage(imageUrl);
      state.currentImageUrl = imageUrl;
    } else {
      // Fallback: carregar um gradiente
      await kawarp.loadGradient([
        [0.16, 0.16, 0.24],
        [0.3, 0.2, 0.4],
      ]);
    }

    // Iniciar animação
    kawarp.start();
    console.log('[Kawarp] Plugin inicializado com sucesso');
  } catch (error) {
    console.error('[Kawarp] Erro ao inicializar Kawarp:', error);
    throw error;
  }
}

/**
 * Observa mudanças na imagem do álbum
 */
function observeAlbumChanges(): MutationObserver | null {
  try {
    const playerContainer = document.querySelector('[data-testid="player"]');
    if (!playerContainer) {
      console.warn('[Kawarp] Container do player não encontrado');
      return null;
    }

    const observer = new MutationObserver(async () => {
      const newImageUrl = getAlbumImageUrl();

      if (
        newImageUrl &&
        newImageUrl !== state.currentImageUrl &&
        state.kawarp &&
        !state.isTransitioning
      ) {
        state.isTransitioning = true;

        try {
          // Aplicar transição
          if (state.container) {
            state.container.classList.add('transitioning');
          }

          // Carregar nova imagem
          await state.kawarp.loadImage(newImageUrl);
          state.currentImageUrl = newImageUrl;

          // Remover classe de transição após duração
          setTimeout(() => {
            if (state.container) {
              state.container.classList.remove('transitioning');
            }
            state.isTransitioning = false;
          }, defaultConfig.transitionDuration);
        } catch (error) {
          console.error('[Kawarp] Erro ao carregar nova imagem:', error);
          state.isTransitioning = false;
        }
      }
    });

    observer.observe(playerContainer, {
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });

    return observer;
  } catch (error) {
    console.error('[Kawarp] Erro ao observar mudanças:', error);
    return null;
  }
}

/**
 * Limpa recursos do Kawarp
 */
function cleanupKawarp(): void {
  if (state.kawarp) {
    try {
      state.kawarp.stop();
      state.kawarp.dispose();
    } catch (error) {
      console.error('[Kawarp] Erro ao limpar Kawarp:', error);
    }
    state.kawarp = null;
  }

  if (state.container) {
    state.container.remove();
    state.container = null;
  }

  state.canvas = null;
  state.currentImageUrl = null;
  state.isTransitioning = false;
}

/**
 * Redimensiona o canvas quando a janela muda de tamanho
 */
function setupResizeListener(): void {
  const resizeHandler = () => {
    if (state.kawarp && state.canvas) {
      state.kawarp.resize();
    }
  };

  window.addEventListener('resize', resizeHandler);
}

export default createPlugin({
  name: () => 'Kawarp Background',
  description: () =>
    'Renderizador de fundos animados fluidos usando WebGL, Kawase blur e domain warping',
  restartNeeded: false,
  config: defaultConfig,
  stylesheets: [style],
  menu: menu,

  renderer: {
    async start() {
      try {
        console.log('[Kawarp] Iniciando plugin...');

        // Carregar biblioteca Kawarp
        await loadKawarpLibrary();

        // Aguardar que o player esteja pronto
        await waitForElement('[data-testid="player"]', 5000);

        // Criar container e canvas
        const canvas = createKawarpContainer();

        // Inicializar Kawarp
        await initializeKawarp(canvas);

        // Observar mudanças de música
        const observer = observeAlbumChanges();
        if (observer) {
          (state as any).observer = observer;
        }

        // Setup resize listener
        setupResizeListener();

        console.log('[Kawarp] Plugin iniciado com sucesso');
      } catch (error) {
        console.error('[Kawarp] Erro ao iniciar plugin:', error);
      }
    },

    stop() {
      try {
        console.log('[Kawarp] Parando plugin...');

        // Limpar observer
        if ((state as any).observer) {
          (state as any).observer.disconnect();
          (state as any).observer = null;
        }

        // Remover listener de resize
        window.removeEventListener('resize', () => {
          if (state.kawarp && state.canvas) {
            state.kawarp.resize();
          }
        });

        // Limpar Kawarp
        cleanupKawarp();

        console.log('[Kawarp] Plugin parado');
      } catch (error) {
        console.error('[Kawarp] Erro ao parar plugin:', error);
      }
    },

    onConfigChange(newConfig: Partial<KawarpPluginConfig>) {
      try {
        // Atualizar configuração local
        Object.assign(defaultConfig, newConfig);

        // Aplicar mudanças ao Kawarp se estiver ativo
        if (state.kawarp) {
          if (newConfig.warpIntensity !== undefined) {
            state.kawarp.warpIntensity = newConfig.warpIntensity;
          }
          if (newConfig.blurPasses !== undefined) {
            state.kawarp.blurPasses = newConfig.blurPasses;
          }
          if (newConfig.animationSpeed !== undefined) {
            state.kawarp.animationSpeed = newConfig.animationSpeed;
          }
          if (newConfig.saturation !== undefined) {
            state.kawarp.saturation = newConfig.saturation;
          }
        }

        console.log('[Kawarp] Configuração atualizada:', newConfig);
      } catch (error) {
        console.error('[Kawarp] Erro ao atualizar configuração:', error);
      }
    },
  },
});
