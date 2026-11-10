
/**
 * ============================================================
 * FILTRO CYBERPUNK
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Receber os dados RGBA de um frame.
 * 2. Aplicar a transformação Cyberpunk.
 * 3. Controlar a intensidade do efeito.
 * 4. Preservar o canal Alpha.
 *
 * Fórmulas principais:
 *
 * R' = min(255, 1.4R + 20)
 * G' = 0.25G
 * B' = min(255, 1.6B + 30)
 * A' = A
 */

import {
    amplifyChannel,
    suppressChannel,
    clamp
} from "../utils/PixelMath.js";


/**
 * Aplica o filtro Cyberpunk.
 *
 * @param {ImageData} imageData
 * Dados RGBA do frame original.
 *
 * @param {number} intensity
 * Intensidade entre 0 e 1.
 *
 * @returns {ImageData}
 * Frame processado.
 */
export function applyCyberpunk(
    imageData,
    intensity = 1
) {

    // Limita a intensidade ao intervalo [0, 1].
    const strength = Math.max(
        0,
        Math.min(1, intensity)
    );

    // Array de pixels RGBA.
    const data = imageData.data;


    // ========================================================
    // PROCESSAMENTO DOS PIXELS
    // ========================================================

    for (let i = 0; i < data.length; i += 4) {

        // Canais originais.
        const red = data[i];

        const green = data[i + 1];

        const blue = data[i + 2];


        // ====================================================
        // TRANSFORMAÇÃO CYBERPUNK
        // ====================================================

        const cyberRed = amplifyChannel(
            red,
            1.4,
            20
        );

        const cyberGreen = suppressChannel(
            green,
            0.25
        );

        const cyberBlue = amplifyChannel(
            blue,
            1.6,
            30
        );


        // ====================================================
        // INTERPOLAÇÃO DA INTENSIDADE
        // ====================================================

        // Fórmula:
        // Cfinal = Coriginal * (1 - t) + Ccyber * t

        data[i] = clamp(
            red * (1 - strength) +
            cyberRed * strength
        );

        data[i + 1] = clamp(
            green * (1 - strength) +
            cyberGreen * strength
        );

        data[i + 2] = clamp(
            blue * (1 - strength) +
            cyberBlue * strength
        );

        // O canal Alpha permanece inalterado.
    }

    return imageData;
}
