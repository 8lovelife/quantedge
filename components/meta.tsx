export const Meta = ({
    label,
    value,
}: {
    label: string
    value?: string | number | null
}) => (
    <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value ?? "-"}</div>
    </div>
);