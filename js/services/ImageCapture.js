
/**
 * ============================================================
 * CLASSE IMAGE CAPTURE
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Capturar a imagem atual do Canvas.
 * 2. Converter o conteúdo para PNG.
 * 3. Disponibilizar o arquivo para download.
 * 4. Liberar recursos temporários.
 *
 * A captura é realizada localmente.
 */

export class ImageCapture {

    /**
     * Construtor do módulo.
     *
     * @param {HTMLCanvasElement} canvasElement
     * Canvas que contém a imagem processada.
     */
    constructor(canvasElement) {

        if (!(canvasElement instanceof HTMLCanvasElement)) {
            throw new TypeError(
                "ImageCapture requer um HTMLCanvasElement."
            );
        }

        // Canvas utilizado como fonte da captura.
        this.canvas = canvasElement;
    }


    /**
     * Converte o conteúdo do Canvas em PNG.
     *
     * @returns {Promise<Blob>}
     * Arquivo de imagem representado como Blob.
     */
    async createImage() {

        return new Promise((resolve, reject) => {

            this.canvas.toBlob(
                (blob) => {

                    if (!blob) {

                        reject(
                            new Error(
                                "Não foi possível gerar a imagem."
                            )
                        );

                        return;
                    }

                    resolve(blob);
                },

                "image/png"
            );
        });
    }


    /**
     * Gera um nome para o arquivo.
     *
     * Utiliza a data e a hora da captura
     * para reduzir conflitos entre nomes.
     *
     * @returns {string}
     * Nome do arquivo PNG.
     */
    generateFileName() {

        const date = new Date();

        const timestamp = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

        const time = [
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
            String(date.getSeconds()).padStart(2, "0")
        ].join("-");

        return `cyberpunk-${timestamp}-${time}.png`;
    }


    /**
     * Captura e disponibiliza a imagem para download.
     *
     * @returns {Promise<string>}
     * Nome do arquivo gerado.
     */
    async download() {

        // Converte o Canvas em PNG.
        const blob = await this.createImage();

        // Cria uma URL temporária para o arquivo.
        const url = URL.createObjectURL(blob);

        // Gera o nome da imagem.
        const fileName = this.generateFileName();

        // Cria um elemento temporário de download.
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;

        // Adiciona o elemento ao documento.
        document.body.appendChild(link);

        try {

            // Solicita o download ao navegador.
            link.click();

        } finally {

            // Remove o elemento temporário.
            link.remove();

            // Libera a URL após a solicitação.
            // O pequeno intervalo permite que o navegador
            // processe o download antes da revogação.
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        }

        console.log(
            "[ImageCapture] Download solicitado:",
            fileName
        );

        return fileName;
    }
}
