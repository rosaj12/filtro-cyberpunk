
/**
 * ============================================================
 * CLASSE RENDERER
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Gerenciar o contexto 2D do Canvas.
 * 2. Renderizar os frames da webcam.
 * 3. Controlar o loop de animação.
 * 4. Aplicar um filtro aos pixels RGBA.
 * 5. Interromper e limpar a renderização.
 */

export class Renderer {

    /**
     * Construtor do renderizador.
     *
     * @param {HTMLCanvasElement} canvasElement
     * Canvas de apresentação.
     *
     * @param {HTMLVideoElement} videoElement
     * Elemento que recebe a webcam.
     */
    constructor(canvasElement, videoElement) {

        // Valida os elementos recebidos.
        if (!(canvasElement instanceof HTMLCanvasElement)) {
            throw new TypeError(
                "Renderer requer um HTMLCanvasElement."
            );
        }

        if (!(videoElement instanceof HTMLVideoElement)) {
            throw new TypeError(
                "Renderer requer um HTMLVideoElement."
            );
        }

        // Elementos de renderização.
        this.canvas = canvasElement;
        this.video = videoElement;

        // Contexto gráfico 2D.
        this.context = this.canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );

        if (!this.context) {
            throw new Error(
                "Não foi possível obter o contexto 2D."
            );
        }

        // Identificador do frame agendado.
        this.animationFrameId = null;

        // Estado do renderizador.
        this.isRendering = false;

        // Função de filtro configurável.
        this.filter = null;

        // Preserva o contexto do método.
        this.renderFrame = this.renderFrame.bind(this);
    }


    /**
     * Define a função responsável pelo filtro.
     *
     * @param {Function|null} filterFunction
     * Função que recebe e retorna ImageData.
     */
    setFilter(filterFunction) {

        if (
            filterFunction !== null &&
            typeof filterFunction !== "function"
        ) {
            throw new TypeError(
                "O filtro deve ser uma função ou null."
            );
        }

        this.filter = filterFunction;
    }


    /**
     * Inicia o loop de renderização.
     */
    start() {

        // Evita múltiplos loops simultâneos.
        if (this.isRendering) {
            return;
        }

        this.isRendering = true;

        // Agenda o primeiro frame.
        this.animationFrameId = requestAnimationFrame(
            this.renderFrame
        );

        console.log(
            "[Renderer] Renderização iniciada."
        );
    }


    /**
     * Renderiza e processa um frame.
     *
     * Fluxo:
     *
     * Video -> Canvas -> ImageData
     *       -> Filtro -> Canvas
     */
    renderFrame() {

        if (!this.isRendering) {
            return;
        }

        // Verifica se o vídeo possui dados válidos.
        if (
            this.video.readyState >=
                HTMLMediaElement.HAVE_CURRENT_DATA &&
            this.video.videoWidth > 0 &&
            this.video.videoHeight > 0
        ) {

            const width = this.canvas.width;

            const height = this.canvas.height;


            // ============================================
            // DESENHO DO FRAME ORIGINAL
            // ============================================

            this.context.drawImage(
                this.video,
                0,
                0,
                width,
                height
            );


            // ============================================
            // PROCESSAMENTO DO FILTRO
            // ============================================

            if (this.filter !== null) {

                // Extrai os pixels RGBA do Canvas.
                const imageData = this.context.getImageData(
                    0,
                    0,
                    width,
                    height
                );

                // Aplica a transformação matemática.
                const processedData = this.filter(
                    imageData
                );

                // Reescreve o frame processado.
                this.context.putImageData(
                    processedData,
                    0,
                    0
                );
            }
        }

        // Agenda o próximo frame.
        this.animationFrameId = requestAnimationFrame(
            this.renderFrame
        );
    }


    /**
     * Interrompe a renderização.
     */
    stop() {

        this.isRendering = false;

        if (this.animationFrameId !== null) {

            cancelAnimationFrame(
                this.animationFrameId
            );

            this.animationFrameId = null;
        }

        console.log(
            "[Renderer] Renderização interrompida."
        );
    }


    /**
     * Limpa o conteúdo do Canvas.
     */
    clear() {

        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    /**
     * Consulta o estado do renderizador.
     *
     * @returns {boolean}
     */
    getRenderingState() {

        return this.isRendering;
    }


    /**
     * Consulta as dimensões do Canvas.
     *
     * @returns {{width: number, height: number}}
     */
    getDimensions() {

        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

}
