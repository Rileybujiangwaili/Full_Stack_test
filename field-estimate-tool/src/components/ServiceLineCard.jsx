function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

export default function ServiceLineCard({
                                            index,
                                            line,
                                            laborRates,
                                            serviceTypes,
                                            colorsMap,
                                            onUpdateType,
                                            onUpdateLevel,
                                            onUpdateHours,
                                            onRemove,
                                            canRemove,
                                        }) {
    const colors = line.type ? colorsMap[line.type] : null;

    const levels = line.type
        ? laborRates.filter((rate) => rate.jobType === line.type)
        : [];

    const activeRate =
        line.type && line.level
            ? laborRates.find(
            (rate) => rate.jobType === line.type && rate.level === line.level
        ) ?? null
            : null;

    const sliderPercent =
        activeRate &&
        activeRate.estimatedHours.max !== activeRate.estimatedHours.min
            ? ((line.hours - activeRate.estimatedHours.min) /
                (activeRate.estimatedHours.max - activeRate.estimatedHours.min)) *
            100
            : 0;

    return (
        <div
            style={{
                background: "#12141C",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 14,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                }}
            >
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#F0F1F4",
                    }}
                >
                    Service line {index + 1}
                </div>

                {canRemove && (
                    <button
                        onClick={() => onRemove(line.id)}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#A0A3AE",
                            borderRadius: 8,
                            padding: "6px 10px",
                            cursor: "pointer",
                            fontSize: 12,
                        }}
                    >
                        Remove
                    </button>
                )}
            </div>

            <div style={{ marginBottom: 14 }}>
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#585C6A",
                        marginBottom: 8,
                    }}
                >
                    Service type
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {serviceTypes.map((type) => {
                        const isActive = line.type === type;
                        const c = colorsMap[type];

                        return (
                            <button
                                key={type}
                                onClick={() => onUpdateType(line.id, type)}
                                style={{
                                    background: isActive ? c.bg : "#0F1118",
                                    border: `1px solid ${
                                        isActive ? c.border : "rgba(255,255,255,0.06)"
                                    }`,
                                    borderRadius: 10,
                                    padding: "12px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textTransform: "capitalize",
                                        color: isActive ? c.text : "#7A7D8A",
                                    }}
                                >
                                    {type}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {line.type && colors && (
                <div style={{ marginBottom: 14 }}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#585C6A",
                            marginBottom: 8,
                        }}
                    >
                        Level
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {levels.map((level) => {
                            const isActive = line.level === level.level;

                            return (
                                <button
                                    key={level.level}
                                    onClick={() => onUpdateLevel(line.id, level.level)}
                                    style={{
                                        flex: "1 1 140px",
                                        background: isActive ? colors.pill : "#0F1118",
                                        border: `1px solid ${
                                            isActive ? colors.border : "rgba(255,255,255,0.06)"
                                        }`,
                                        borderRadius: 8,
                                        padding: "10px 8px",
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            textTransform: "capitalize",
                                            color: isActive ? colors.text : "#7A7D8A",
                                        }}
                                    >
                                        {level.level.replace(/-/g, " ")}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 700,
                                            marginTop: 3,
                                            color: isActive ? colors.accent : "#4A4D58",
                                        }}
                                    >
                                        {fmt(level.hourlyRate)}
                                        <span style={{ fontSize: 10 }}>/hr</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeRate && colors && (
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#585C6A",
                            marginBottom: 8,
                        }}
                    >
                        Estimated hours
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
            <span style={{ fontSize: 12, color: "#585C6A" }}>
              Min {activeRate.estimatedHours.min}h
            </span>
                        <span
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: colors.accent,
                            }}
                        >
              {line.hours}h
            </span>
                        <span style={{ fontSize: 12, color: "#585C6A" }}>
              Max {activeRate.estimatedHours.max}h
            </span>
                    </div>

                    <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                height: 6,
                                background: "#1A1D28",
                                borderRadius: 3,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                height: 6,
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}88)`,
                                width: `${sliderPercent}%`,
                            }}
                        />
                        <input
                            type="range"
                            min={activeRate.estimatedHours.min}
                            max={activeRate.estimatedHours.max}
                            step={0.5}
                            value={line.hours}
                            onChange={(e) => onUpdateHours(line.id, parseFloat(e.target.value))}
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: 40,
                                opacity: 0,
                                cursor: "pointer",
                                margin: 0,
                                zIndex: 2,
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                left: `calc(${sliderPercent}% - 10px)`,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: colors.accent,
                                border: "3px solid #12141C",
                                pointerEvents: "none",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 8,
                            padding: "8px 12px",
                            background: colors.pill,
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <span style={{ fontSize: 13, color: "#7A7D8A" }}>Labor cost</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: colors.accent }}>
              {fmt(line.laborCost)}
            </span>
                    </div>
                </div>
            )}
        </div>
    );
}