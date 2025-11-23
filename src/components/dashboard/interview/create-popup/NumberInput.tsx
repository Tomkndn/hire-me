interface NumberInputProps {
    label: string;
    value: number;
    max: number;
    min: number;
    onChange: (val: number) => void;
}

export function NumberInput({ label, value, max, min, onChange }: NumberInputProps) {


    return (
        <div className="flex flex-row justify-center items-center mt-2">
            <h3 className="font-medium text-sm">{label}</h3>
            <input
                type="number"
                step="1"
                min={min}
                max={max}
                className="border-2 text-center focus:outline-none bg-slate-100 rounded-md border-gray-500 w-14 px-2 py-0.5 ml-3 text-sm"
                value={value}
                onChange={(e) => {
                    let val = e.target.value;
                    if (val === "" || (Number.isInteger(Number(val)) && Number(val) >= min)) {
                        if (Number(val) > max) {val = String(max)};
                        onChange(Number(val));
                    }
                }}
            />
        </div>
    );
};
