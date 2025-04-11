export interface AlgorithmOption {
    value: string
    label: string
    desc: string,
    info: string,
    defaultParameters?: Record<string, any> // ← most JSON-friendly

    defaultRisk?: Record<string, any> // ← most JSON-friendly
}