import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCNPJ(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

export function validateCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/[^\d]+/g, "");

    if (cleanCNPJ == "") return false;

    if (cleanCNPJ.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (
        cleanCNPJ == "00000000000000" ||
        cleanCNPJ == "11111111111111" ||
        cleanCNPJ == "22222222222222" ||
        cleanCNPJ == "33333333333333" ||
        cleanCNPJ == "44444444444444" ||
        cleanCNPJ == "55555555555555" ||
        cleanCNPJ == "66666666666666" ||
        cleanCNPJ == "77777777777777" ||
        cleanCNPJ == "88888888888888" ||
        cleanCNPJ == "99999999999999"
    )
        return false;

    // Valida DVs
    let tamanho = cleanCNPJ.length - 2;
    let numeros = cleanCNPJ.substring(0, tamanho);
    const digitos = cleanCNPJ.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cleanCNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != parseInt(digitos.charAt(1))) return false;

    return true;
}
