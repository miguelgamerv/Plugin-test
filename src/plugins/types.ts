/**
 * YouTube Music Kawarp Plugin - Type Definitions
 * Tipos para configuração e estado do plugin
 */

export interface KawarpPluginConfig {
  /**
   * Intensidade do efeito de deformação (0-1)
   * Valores mais altos = efeito mais pronunciado
   */
  warpIntensity: number;

  /**
   * Número de passes de blur Kawase (1-40)
   * Valores mais altos = mais blur, mais suave
   */
  blurPasses: number;

  /**
   * Velocidade da animação (0.1-2)
   * 1 = velocidade normal
   */
  animationSpeed: number;

  /**
   * Duração da transição entre músicas em milissegundos
   */
  transitionDuration: number;

  /**
   * Saturação das cores (0.5-2)
   */
  saturation: number;

  /**
   * Ativar/desativar o plugin
   */
  enabled: boolean;
}

export interface KawarpInstance {
  loadImage(url: string): Promise<void>;
  loadBlob(blob: Blob | File): Promise<void>;
  loadGradient(colors: [number, number, number][], angle?: number): Promise<void>;
  start(): void;
  stop(): void;
  resize(): void;
  dispose(): void;
}

export interface RendererState {
  kawarp: KawarpInstance | null;
  canvas: HTMLCanvasElement | null;
  container: HTMLElement | null;
  currentImageUrl: string | null;
  isTransitioning: boolean;
}
