
/**
 * ============================================================
 * CLASSE APP
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Coordenar os módulos da aplicação.
 * 2. Gerenciar os controles da interface.
 * 3. Inicializar e encerrar a webcam.
 * 4. Controlar a renderização dos frames no Canvas.
 * 5. Integrar o processamento matemático Cyberpunk.
 * 6. Controlar a intensidade do filtro.
 * 7. Capturar imagens processadas em formato PNG.
 * 8. Atualizar o estado visual da aplicação.
 * 9. Gerenciar erros e liberar recursos.
 *
 * Módulos integrados:
 *
 * - Camera
 * - Renderer
 * - Cyberpunk
 * - ImageCapture
 *
 * Dependência indireta:
 *
 * - PixelMath (utilizado por Cyberpunk)
 */

import { Camera } from "./core/Camera.js";

import { Renderer } from "./core/Renderer.js";

import { applyCyberpunk } from "./filters/Cyberpunk.js";

import { ImageCapture } from "./services/ImageCapture.js";


export class App {

    /**
     * ========================================================
     * CONSTRUTOR PRINCIPAL
     * ========================================================
     *
     * Obtém os elementos HTML, instancia os módulos
     * e configura o processamento Cyberpunk.
     */
    constructor() {

        // ====================================================
        // ELEMENTOS DA INTERFACE
        // ====================================================

        // Elemento que recebe o fluxo da webcam.
        this.video = document.getElementById(
            "camera-video"
        );

        // Canvas responsável pela apresentação dos frames.
        this.canvas = document.getElementById(
            "camera-canvas"
        );

        // Elemento responsável pelas mensagens.
        this.status = document.getElementById(
            "camera-status"
        );

        // Botão para iniciar a câmera.
        this.startButton = document.getElementById(
            "start-camera"
        );

        // Botão para encerrar a câmera.
        this.stopButton = document.getElementById(
            "stop-camera"
        );

        // Botão responsável pela captura de imagens.
        this.captureButton = document.getElementById(
            "capture-image"
        );

        // Controle deslizante da intensidade.
        this.intensitySlider = document.getElementById(
            "filter-intensity"
        );

        // Indicador percentual da intensidade.
        this.intensityValue = document.getElementById(
            "intensity-value"
        );


        // ====================================================
        // INICIALIZAÇÃO DOS MÓDULOS
        // ====================================================

        // Gerenciamento do fluxo da webcam.
        this.camera = new Camera(
            this.video
        );

        // Renderização dos frames no Canvas.
        this.renderer = new Renderer(
            this.canvas,
            this.video
        );

        // Exportação de imagens em formato PNG.
        this.imageCapture = new ImageCapture(
            this.canvas
        );


        // ====================================================
        // ESTADOS DA APLICAÇÃO
        // ====================================================

        // Indica se a webcam está em execução.
        this.isRunning = false;

        // Impede inicializações simultâneas.
        this.isStarting = false;

        // Indica se uma captura está em andamento.
        this.isCapturing = false;

        // Identifica solicitações de inicialização.
        this.startRequestId = 0;

        // Intensidade inicial do filtro: 100%.
        this.filterIntensity = 1;


        // ====================================================
        // CONFIGURAÇÃO DO FILTRO CYBERPUNK
        // ====================================================

        /**
         * Registra a função de processamento Cyberpunk.
         *
         * O Renderer executará essa função para cada
         * frame capturado da webcam.
         *
         * A intensidade é consultada dinamicamente,
         * permitindo alterações durante a renderização.
         */
        this.renderer.setFilter(
            (imageData) => applyCyberpunk(
                imageData,
                this.filterIntensity
            )
        );
    }


    /**
     * ========================================================
     * INICIALIZAÇÃO DA APLICAÇÃO
     * ========================================================
     *
     * Configura os eventos dos controles e
     * prepara o estado inicial da interface.
     */
    init() {

        // ====================================================
        // EVENTOS DA WEBCAM
        // ====================================================

        // Evento de inicialização da webcam.
        this.startButton.addEventListener(
            "click",
            () => this.startCamera()
        );

        // Evento de encerramento da webcam.
        this.stopButton.addEventListener(
            "click",
            () => this.stopCamera()
        );


        // ====================================================
        // EVENTO DE CAPTURA DE IMAGEM
        // ====================================================

        // Solicita a exportação do frame atual.
        this.captureButton.addEventListener(
            "click",
            () => this.captureImage()
        );


        // ====================================================
        // EVENTO DE INTENSIDADE DO FILTRO
        // ====================================================

        this.intensitySlider.addEventListener(
            "input",
            (event) => {

                // Obtém o valor percentual.
                const percentage = Number(
                    event.target.value
                );

                // Converte o percentual para [0, 1].
                this.filterIntensity = percentage / 100;

                // Atualiza o indicador visual.
                this.intensityValue.textContent =
                    `${percentage}%`;
            }
        );


        // ====================================================
        // LIBERAÇÃO DOS RECURSOS
        // ====================================================

        // Encerra os módulos ao sair da página.
        window.addEventListener(
            "pagehide",
            () => {

                // Invalida inicializações pendentes.
                this.startRequestId++;

                // Interrompe a renderização.
                this.renderer.stop();

                // Libera o dispositivo de captura.
                this.camera.stop();

                // Atualiza o estado interno.
                this.isRunning = false;
            }
        );


        // ====================================================
        // CONFIGURAÇÃO INICIAL
        // ====================================================

        // Sincroniza o valor inicial da intensidade.
        this.intensitySlider.value = "100";

        this.intensityValue.textContent = "100%";

        // Atualiza os controles.
        this.updateControls();

        // Apresenta a mensagem inicial.
        this.updateStatus(
            "Aplicação pronta. Aguardando câmera."
        );

        console.log(
            "[Filtro Cyberpunk] Aplicação inicializada."
        );

        console.log(
            "[App] Filtro Cyberpunk configurado."
        );
    }


    /**
     * ========================================================
     * INICIALIZAÇÃO DA WEBCAM
     * ========================================================
     *
     * 1. Solicita acesso à webcam.
     * 2. Aguarda a inicialização do fluxo de vídeo.
     * 3. Inicia a renderização dos frames.
     * 4. Aplica o filtro Cyberpunk automaticamente.
     * 5. Habilita os controles da aplicação.
     */
    async startCamera() {

        // Impede múltiplas inicializações.
        if (this.isRunning || this.isStarting) {
            return;
        }

        // Identifica esta solicitação de inicialização.
        const requestId = ++this.startRequestId;

        // Indica que a inicialização está em andamento.
        this.isStarting = true;

        // Atualiza os controles.
        this.updateControls();

        // Informa ao usuário sobre a solicitação.
        this.updateStatus(
            "Solicitando acesso à câmera..."
        );

        try {

            // ================================================
            // INICIALIZAÇÃO DA CÂMERA
            // ================================================

            // Solicita o fluxo de vídeo.
            await this.camera.start();

            // Ignora uma inicialização invalidada.
            if (requestId !== this.startRequestId) {
                this.camera.stop();
                return;
            }


            // ================================================
            // INICIALIZAÇÃO DO RENDERER
            // ================================================

            /**
             * Inicia a renderização contínua.
             *
             * O Renderer executará:
             *
             * 1. drawImage()
             * 2. getImageData()
             * 3. applyCyberpunk()
             * 4. putImageData()
             */
            this.renderer.start();


            // ================================================
            // ATUALIZAÇÃO DO ESTADO
            // ================================================

            // Indica que a aplicação está em execução.
            this.isRunning = true;

            // Atualiza a mensagem da interface.
            this.updateStatus(
                "Câmera ativa. Filtro Cyberpunk aplicado."
            );

            console.log(
                "[App] Webcam, Renderer e Cyberpunk iniciados."
            );

        } catch (error) {

            // Ignora erros de solicitações invalidadas.
            if (requestId !== this.startRequestId) {
                return;
            }

            // Interrompe a renderização.
            this.renderer.stop();

            // Limpa o Canvas.
            this.renderer.clear();

            // Libera o fluxo da câmera.
            this.camera.stop();

            // Restaura o estado da aplicação.
            this.isRunning = false;

            // Apresenta a mensagem de erro.
            this.updateStatus(
                this.getCameraErrorMessage(error)
            );

            console.error(
                "[App] Falha ao iniciar a aplicação:",
                error
            );

        } finally {

            // Somente a solicitação atual pode
            // modificar o estado de inicialização.
            if (requestId === this.startRequestId) {

                this.isStarting = false;

                this.updateControls();
            }
        }
    }


    /**
     * ========================================================
     * ENCERRAMENTO DA WEBCAM
     * ========================================================
     *
     * Interrompe a renderização antes de liberar
     * o fluxo da câmera.
     */
    stopCamera() {

        // Invalida inicializações pendentes.
        this.startRequestId++;

        // Interrompe o loop de renderização.
        this.renderer.stop();

        // Remove o último frame do Canvas.
        this.renderer.clear();

        // Encerra o fluxo da webcam.
        this.camera.stop();

        // Atualiza o estado principal.
        this.isRunning = false;

        // Finaliza o estado de inicialização.
        this.isStarting = false;

        // Atualiza os controles.
        this.updateControls();

        // Informa o encerramento ao usuário.
        this.updateStatus(
            "Câmera desligada."
        );

        console.log(
            "[App] Webcam e Renderer encerrados."
        );
    }


    /**
     * ========================================================
     * CAPTURA DE IMAGEM
     * ========================================================
     *
     * Exporta o frame atual do Canvas em formato PNG.
     *
     * O Canvas já contém o filtro Cyberpunk aplicado,
     * portanto não é necessário processar a imagem
     * novamente.
     */
    async captureImage() {

        // Impede capturas com a câmera desligada
        // ou enquanto outra captura estiver em andamento.
        if (
            !this.isRunning ||
            !this.renderer.getRenderingState() ||
            this.isCapturing
        ) {
            return;
        }

        // Marca o início da captura.
        this.isCapturing = true;

        // Atualiza os controles.
        this.updateControls();

        try {

            // Solicita a exportação ao módulo ImageCapture.
            const fileName = await this.imageCapture.download();

            // Informa que o download foi solicitado.
            this.updateStatus(
                `Download solicitado: ${fileName}`
            );

            console.log(
                "[App] Captura solicitada:",
                fileName
            );

        } catch (error) {

            // Apresenta a mensagem de falha.
            this.updateStatus(
                "Não foi possível capturar a imagem."
            );

            console.error(
                "[App] Erro na captura:",
                error
            );

        } finally {

            // Finaliza o estado de captura.
            this.isCapturing = false;

            // Restaura os controles.
            this.updateControls();
        }
    }


    /**
     * ========================================================
     * CONTROLE DA INTERFACE
     * ========================================================
     *
     * Atualiza a disponibilidade dos botões
     * e do controle de intensidade.
     */
    updateControls() {

        // Iniciar câmera:
        // disponível apenas quando estiver desligada.
        this.startButton.disabled =
            this.isRunning || this.isStarting;

        // Parar câmera:
        // disponível somente durante a execução.
        this.stopButton.disabled =
            !this.isRunning;

        // Capturar imagem:
        // disponível durante a renderização,
        // exceto quando outra captura estiver em andamento.
        this.captureButton.disabled =
            !this.isRunning ||
            this.isCapturing;

        // Intensidade:
        // ajustável somente durante a execução.
        this.intensitySlider.disabled =
            !this.isRunning;
    }


    /**
     * ========================================================
     * ATUALIZAÇÃO DE STATUS
     * ========================================================
     *
     * Modifica a mensagem apresentada ao usuário.
     *
     * @param {string} message
     * Mensagem que será exibida na interface.
     */
    updateStatus(message) {

        this.status.textContent = message;
    }


    /**
     * ========================================================
     * TRATAMENTO DE ERROS DA WEBCAM
     * ========================================================
     *
     * Converte erros técnicos da MediaDevices API
     * em mensagens compreensíveis.
     *
     * @param {Error} error
     * Erro produzido durante a inicialização.
     *
     * @returns {string}
     * Mensagem correspondente ao erro.
     */
    getCameraErrorMessage(error) {

        switch (error?.name) {

            case "NotAllowedError":
            case "PermissionDeniedError":
                return "Permissão de câmera negada.";

            case "NotFoundError":
            case "DevicesNotFoundError":
                return "Nenhuma câmera foi encontrada.";

            case "NotReadableError":
            case "TrackStartError":
                return "A câmera está indisponível ou em uso.";

            case "OverconstrainedError":
                return "A câmera não atende às configurações solicitadas.";

            case "SecurityError":
                return "Acesso à câmera bloqueado por segurança.";

            default:
                return (
                    error?.message ||
                    "Não foi possível iniciar a câmera."
                );
        }
    }

}
