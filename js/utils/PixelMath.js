
/**
 * ============================================================
 * MÓDULO PIXEL MATH
 * ============================================================
 *
 * Responsabilidades:
 *
 * 1. Limitar valores ao intervalo RGB.
 * 2. Aplicar operações matemáticas aos canais.
 * 3. Disponibilizar funções reutilizáveis.
 *
 * Intervalo válido dos canais:
 *
 * 0 <= R, G, B <= 255
 */


/**
 * Limita um valor ao intervalo [0, 255].
 *
 * @param {number} value
 * Valor numérico que será limitado.
 *
 * @returns {number}
 * Valor dentro do intervalo RGB.
 */
export function clamp(value) {

    return Math.max(
        0,
        Math.min(255, value)
    );
}


/**
 * Amplifica um canal de cor.
 *
 * Fórmula:
 *
 * C' = clamp(C * factor + offset)
 *
 * @param {number} channel
 * Intensidade original do canal.
 *
 * @param {number} factor
 * Fator multiplicativo.
 *
 * @param {number} offset
 * Deslocamento aditivo.
 *
 * @returns {number}
 * Nova intensidade do canal.
 */
export function amplifyChannel(
    channel,
    factor,
    offset = 0
) {

    return clamp(
        channel * factor + offset
    );
}


/**
 * Reduz a intensidade de um canal.
 *
 * Fórmula:
 *
 * C' = clamp(C * factor)
 *
 * @param {number} channel
 * Intensidade original.
 *
 * @param {number} factor
 * Fator de redução.
 *
 * @returns {number}
 * Intensidade transformada.
 */
export function suppressChannel(
    channel,
    factor
) {

    return clamp(
        channel * factor
    );
}
