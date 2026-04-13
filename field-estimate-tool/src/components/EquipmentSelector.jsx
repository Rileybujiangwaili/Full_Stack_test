function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

const qtyButtonStyle = {
    background: "none",
    border: "none",
    color: "#7A7D8A",
    cursor: "pointer",
    padding: "2px 6px",
    fontSize: 14,
};

export default function EquipmentSelector({
                                              activeRate,
                                              colors,
                                              equipmentSearch,
                                              setEquipmentSearch,
                                              selectedCategory,
                                              setSelectedCategory,
                                              equipmentCategories,
                                              equipmentByCategory,
                                              selectedEquipment,
                                              toggleEquipment,
                                              updateQty,
                                          }) {
    if (!activeRate || !colors) return null;

    return (
        <div style={{ padding: "24px 20px 0" }}>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#484B58",
                    marginBottom: 10,
                }}
            >
                5 — Equipment
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: "wrap",
                }}
            >
                <input
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                    placeholder="Search equipment"
                    style={{
                        flex: "1 1 220px",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        background: "#12141C",
                        color: "#E4E5EA",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        flex: "0 0 180px",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: `1px solid ${colors.border}`,
                        background: "#12141C",
                        color: "#E4E5EA",
                        fontSize: 13,
                        outline: "none",
                    }}
                >
                    {equipmentCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {Object.keys(equipmentByCategory).length === 0 && (
                <div
                    style={{
                        background: "#12141C",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        padding: 18,
                        color: "#7A7D8A",
                        fontSize: 13,
                    }}
                >
                    No equipment matches this search or category.
                </div>
            )}

            {Object.entries(equipmentByCategory).map(([category, items]) => (
                <div key={category} style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#585C6A",
                            marginBottom: 6,
                        }}
                    >
                        {category}
                    </div>

                    {items.map((item) => {
                        const selected = selectedEquipment.find((eq) => eq.id === item.id);
                        const isSelected = Boolean(selected);

                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 12px",
                                    marginBottom: 4,
                                    borderRadius: 8,
                                    background: isSelected ? colors.pill : "#12141C",
                                    border: `1px solid ${
                                        isSelected ? colors.border : "rgba(255,255,255,0.05)"
                                    }`,
                                }}
                            >
                                <button
                                    onClick={() => toggleEquipment(item.id)}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        textAlign: "left",
                                        color: "inherit",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 5,
                                            flexShrink: 0,
                                            border: `1.5px solid ${
                                                isSelected ? colors.accent : "#3A3D48"
                                            }`,
                                            background: isSelected ? colors.accent : "transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {isSelected && (
                                            <span
                                                style={{
                                                    color: "#0B0D13",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                }}
                                            >
                        ✓
                      </span>
                                        )}
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: isSelected ? colors.text : "#A0A3AE",
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#484B58", marginTop: 1 }}>
                                            {item.brand} · {item.modelNumber}
                                        </div>
                                    </div>
                                </button>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginLeft: 8,
                                        flexShrink: 0,
                                    }}
                                >
                                    {isSelected && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                background: "#0B0D13",
                                                borderRadius: 5,
                                                padding: "2px 4px",
                                            }}
                                        >
                                            <button
                                                onClick={() => updateQty(item.id, -1)}
                                                style={qtyButtonStyle}
                                            >
                                                −
                                            </button>
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: colors.text,
                                                    minWidth: 16,
                                                    textAlign: "center",
                                                }}
                                            >
                        {selected.qty}
                      </span>
                                            <button
                                                onClick={() => updateQty(item.id, 1)}
                                                style={qtyButtonStyle}
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}

                                    <div style={{ textAlign: "right", minWidth: 72 }}>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: isSelected ? colors.accent : "#5A5D68",
                                            }}
                                        >
                                            {fmt(isSelected ? item.baseCost * selected.qty : item.baseCost)}
                                        </div>
                                        <div style={{ fontSize: 10, color: "#3A3D48" }}>
                                            base cost
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}