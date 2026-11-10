
/**
 * ============================================================
 * CLASSE CAMERA
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Solicitar acesso à webcam.
 * 2. Gerenciar o fluxo MediaStream.
 * 3. Conectar o fluxo ao elemento HTMLVideoElement.
 * 4. Encerrar a captura e liberar recursos.
 * 5. Informar o estado atual da câmera.
 */

export class Camera {

    /**
     * Construtor do módulo.
     *
     * @param {HTMLVideoElement} videoElement
     * Elemento HTML que receberá o fluxo da webcam.
     */
    constructor(videoElement) {

        if (!(videoElement instanceof HTMLVideoElement)) {
            throw new TypeError(
                "Camera requer um elemento HTMLVideoElement."
            );
        }

        // Elemento responsável por receber os frames.
        this.video = videoElement;

        // Fluxo de mídia obtido do navegador.
        this.stream = null;

        // Estado da câmera.
        this.isActive = false;
    }

    /**
     * Inicializa a webcam.
     *
     * Solicita autorização ao navegador e
     * associa o MediaStream ao elemento de vídeo.
     *
     * @returns {Promise<MediaStream>}
     * Fluxo de mídia da câmera.
     */
    async start() {

        // Impede inicializações duplicadas.
        if (this.isActive && this.stream) {
            return this.stream;
        }

        // Verifica se a API está disponível.
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error(
                "A API de câmera não está disponível. " +
                "Utilize HTTPS ou localhost."
            );
        }

        try {

            // Solicita somente o fluxo de vídeo.
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },

                audio: false
            });

            // Armazena o fluxo recebido.
            this.stream = stream;

            // Conecta a webcam ao elemento HTML.
            this.video.srcObject = stream;

            // Inicia a reprodução do vídeo.
            await this.video.play();

            // Atualiza o estado interno.
            this.isActive = true;

            console.log(
                "[Camera] Webcam inicializada."
            );

            return stream;

        } catch (error) {

            // Libera recursos caso a inicialização falhe.
            this.stop();

            console.error(
                "[Camera] Falha ao inicializar:",
                error
            );

            throw error;
        }
    }

    /**
     * Encerra a captura de vídeo.
     *
     * Interrompe todas as tracks do MediaStream,
     * liberando a webcam para outras aplicações.
     */
    stop() {

        if (this.stream) {

            // Interrompe todas as tracks existentes.
            this.stream.getTracks().forEach((track) => {
                track.stop();
            });

            this.stream = null;
        }

        // Interrompe a reprodução do elemento.
        this.video.pause();

        // Remove a referência ao fluxo anterior.
        this.video.srcObject = null;

        // Atualiza o estado interno.
        this.isActive = false;

        console.log(
            "[Camera] Webcam encerrada."
        );
    }

    /**
     * Retorna se a webcam está ativa.
     *
     * @returns {boolean}
     */
    getActiveState() {

        return (
            this.isActive &&
            this.stream !== null &&
            this.stream.getVideoTracks().some(
                (track) => track.readyState === "live"
            )
        );
    }

    /**
     * Retorna as dimensões reais do vídeo.
     *
     * @returns {{width: number, height: number}}
     */
    getDimensions() {

        return {
            width: this.video.videoWidth,
            height: this.video.videoHeight
        };
    }

}
