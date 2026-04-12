import { useMemo, useState } from "react";
import rawCustomers from "../data/customers.json";
import rawEquipment from "../data/equipment.json";
import rawLaborRates from "../data/labor_rates.json";

import {
    normalizeCustomers,
    normalizeEquipmentList,
    normalizeLaborRates,
} from "../utils/normalizeData";

import {
    addRetailPricing,
    calculateEstimateTotal,
    getActiveRate,
    getLevelsForType,
    getRelevantEquipment,
    getServiceTypes,
    groupEquipmentByCategory,
} from "../utils/estimateCalculator";

const CUSTOMERS = normalizeCustomers(rawCustomers);
const LABOR_RATES = normalizeLaborRates(rawLaborRates);
const EQUIPMENT = addRetailPricing(normalizeEquipmentList(rawEquipment));

const TYPE_COLORS = {
    diagnostic: {
        bg: "#1C1635",
        accent: "#9B8FE8",
        text: "#C9C3F4",
        pill: "#2D2550",
        border: "#3A2F6B",
        glow: "#9B8FE820",
    },
    repair: {
        bg: "#0F2922",
        accent: "#3DD9A0",
        text: "#8EECC8",
        pill: "#163D32",
        border: "#1F5747",
        glow: "#3DD9A020",
    },
    install: {
        bg: "#2A1610",
        accent: "#E87B45",
        text: "#F4B896",
        pill: "#3D2118",
        border: "#5C3222",
        glow: "#E87B4520",
    },
    maintenance: {
        bg: "#0F1E2E",
        accent: "#4A9FE8",
        text: "#94C8F4",
        pill: "#162C42",
        border: "#1E3E5C",
        glow: "#4A9FE820",
    },
    ductwork: {
        bg: "#261C08",
        accent: "#D4A03A",
        text: "#E8CC82",
        pill: "#382A10",
        border: "#5A4318",
        glow: "#D4A03A20",
    },
};

const ICONS = {
    diagnostic: "⚡",
    repair: "🔧",
    install: "📦",
    maintenance: "🛡️",
    ductwork: "🌀",
};

function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

function formatDate(value) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US");
}

function Info({ label, value }) {
    return (
        <div
            style={{
                background: "#0F1118",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "10px 12px",
            }}
        >
            <div
                style={{
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#585C6A",
                    marginBottom: 4,
                    fontWeight: 600,
                }}
            >
                {label}
            </div>
            <div style={{ fontSize: 13, color: "#E4E5EA", fontWeight: 500 }}>
                {value}
            </div>
        </div>
    );
}

const qtyButtonStyle = {
    background: "none",
    border: "none",
    color: "#7A7D8A",
    cursor: "pointer",
    padding: "2px 6px",
    fontSize: 14,
};

export default function FieldEstimateTool() {
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [selectedType, setSelectedType] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [hours, setHours] = useState(null);

    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [equipmentSearch, setEquipmentSearch] = useState("");

    const selectedCustomer = useMemo(() => {
        return CUSTOMERS.find((customer) => customer.id === selectedCustomerId) ?? null;
    }, [selectedCustomerId]);

    const filteredCustomers = useMemo(() => {
        const q = customerSearch.trim().toLowerCase();
        if (!q) return CUSTOMERS;

        return CUSTOMERS.filter((customer) => {
            return (
                customer.name.toLowerCase().includes(q) ||
                customer.address.toLowerCase().includes(q) ||
                customer.phone.toLowerCase().includes(q) ||
                customer.systemType.toLowerCase().includes(q)
            );
        });
    }, [customerSearch]);

    const serviceTypes = useMemo(() => getServiceTypes(LABOR_RATES), []);
    const levels = useMemo(
        () => getLevelsForType(LABOR_RATES, selectedType),
        [selectedType]
    );
    const activeRate = useMemo(
        () => getActiveRate(LABOR_RATES, selectedType, selectedLevel),
        [selectedType, selectedLevel]
    );

    const relevantEquipment = useMemo(() => {
        return getRelevantEquipment({
            equipment: EQUIPMENT,
            selectedType,
            selectedLevel,
            searchQuery: equipmentSearch,
            customer: selectedCustomer,
        });
    }, [selectedType, selectedLevel, equipmentSearch, selectedCustomer]);

    const equipmentByCategory = useMemo(() => {
        return groupEquipmentByCategory(relevantEquipment);
    }, [relevantEquipment]);

    const { laborCost, equipmentCost, totalCost } = useMemo(() => {
        return calculateEstimateTotal({
            selectedEquipment,
            equipmentCatalog: EQUIPMENT,
            activeRate,
            hours,
        });
    }, [selectedEquipment, activeRate, hours]);

    const colors = selectedType ? TYPE_COLORS[selectedType] : null;

    const sliderPercent =
        activeRate && activeRate.estimatedHours.max !== activeRate.estimatedHours.min
            ? ((hours - activeRate.estimatedHours.min) /
                (activeRate.estimatedHours.max - activeRate.estimatedHours.min)) *
            100
            : 0;

    function handleSelectType(type) {
        setSelectedType(type);
        setSelectedEquipment([]);
        setEquipmentSearch("");

        const firstRate = LABOR_RATES.find((rate) => rate.jobType === type);
        if (firstRate) {
            setSelectedLevel(firstRate.level);
            setHours(firstRate.estimatedHours.min);
        } else {
            setSelectedLevel(null);
            setHours(null);
        }
    }

    function handleSelectLevel(level) {
        setSelectedLevel(level);
        setSelectedEquipment([]);
        setEquipmentSearch("");

        const rate = LABOR_RATES.find(
            (item) => item.jobType === selectedType && item.level === level
        );

        if (rate) setHours(rate.estimatedHours.min);
    }

    function toggleEquipment(id) {
        setSelectedEquipment((prev) => {
            const exists = prev.find((item) => item.id === id);
            if (exists) {
                return prev.filter((item) => item.id !== id);
            }
            return [...prev, { id, qty: 1 }];
        });
    }

    function updateQty(id, delta) {
        setSelectedEquipment((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                return {
                    ...item,
                    qty: Math.max(1, item.qty + delta),
                };
            })
        );
    }

    return (
        <div
            style={{
                fontFamily: "'Outfit', 'Avenir Next', system-ui, sans-serif",
                background: "#0B0D13",
                color: "#D8DAE0",
                minHeight: "100vh",
                maxWidth: 640,
                margin: "0 auto",
                paddingBottom: 48,
            }}
        >
            <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            <div
                style={{
                    padding: "28px 20px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#585C6A",
                        marginBottom: 6,
                    }}
                >
                    HVAC field workflow
                </div>
                <h1
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "-0.02em",
                        color: "#F0F1F4",
                    }}
                >
                    Field Estimate Tool
                </h1>
                <p
                    style={{
                        fontSize: 13,
                        color: "#585C6A",
                        margin: "6px 0 0",
                        lineHeight: 1.5,
                    }}
                >
                    Select a customer, choose a service type, add equipment, and generate
                    a clean on-site estimate.
                </p>
            </div>

            <div style={{ padding: "20px 20px 0" }}>
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
                    1 — Customer
                </div>

                <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name, address, phone, or system type"
                    style={{
                        width: "100%",
                        padding: "11px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "#12141C",
                        color: "#E4E5EA",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                        marginBottom: 12,
                    }}
                />

                <div
                    style={{
                        maxHeight: 220,
                        overflowY: "auto",
                        display: "grid",
                        gap: 8,
                    }}
                >
                    {filteredCustomers.map((customer) => {
                        const isActive = selectedCustomerId === customer.id;

                        return (
                            <button
                                key={customer.id}
                                onClick={() => setSelectedCustomerId(customer.id)}
                                style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    borderRadius: 10,
                                    border: `1px solid ${
                                        isActive ? "#4A9FE8" : "rgba(255,255,255,0.06)"
                                    }`,
                                    background: isActive ? "#162C42" : "#12141C",
                                    color: "#E4E5EA",
                                    cursor: "pointer",
                                }}
                            >
                                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                                    {customer.name}
                                </div>
                                <div style={{ fontSize: 11.5, color: "#7A7D8A", marginTop: 3 }}>
                                    {customer.address}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedCustomer && (
                <div style={{ padding: "20px 20px 0" }}>
                    <div
                        style={{
                            background: "#12141C",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 12,
                            padding: "16px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#F0F1F4",
                                marginBottom: 10,
                            }}
                        >
                            Property details
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <Info label="Phone" value={selectedCustomer.phone || "N/A"} />
                            <Info label="Property type" value={selectedCustomer.propertyType} />
                            <Info
                                label="Square footage"
                                value={
                                    selectedCustomer.squareFootage
                                        ? `${selectedCustomer.squareFootage.toLocaleString()} sq ft`
                                        : "N/A"
                                }
                            />
                            <Info label="System type" value={selectedCustomer.systemType || "N/A"} />
                            <Info
                                label="System age"
                                value={
                                    selectedCustomer.systemAge != null
                                        ? `${selectedCustomer.systemAge} years`
                                        : "N/A"
                                }
                            />
                            <Info
                                label="Last service"
                                value={formatDate(selectedCustomer.lastServiceDate)}
                            />
                        </div>
                    </div>
                </div>
            )}

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
                    2 — Service type
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {serviceTypes.map((type) => {
                        const isActive = selectedType === type;
                        const c = TYPE_COLORS[type];
                        const levelCount = LABOR_RATES.filter((rate) => rate.jobType === type).length;

                        return (
                            <button
                                key={type}
                                onClick={() => handleSelectType(type)}
                                style={{
                                    background: isActive ? c.bg : "#12141C",
                                    border: `1px solid ${
                                        isActive ? c.border : "rgba(255,255,255,0.06)"
                                    }`,
                                    borderRadius: 10,
                                    padding: "14px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <div style={{ fontSize: 20, marginBottom: 6 }}>{ICONS[type]}</div>
                                <div
                                    style={{
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        textTransform: "capitalize",
                                        color: isActive ? c.text : "#7A7D8A",
                                    }}
                                >
                                    {type}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: isActive ? c.accent : "#484B58",
                                        marginTop: 3,
                                        fontWeight: 500,
                                    }}
                                >
                                    {levelCount} level{levelCount > 1 ? "s" : ""}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedType && colors && (
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
                        3 — Level
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {levels.map((level) => {
                            const isActive = selectedLevel === level.level;

                            return (
                                <button
                                    key={level.level}
                                    onClick={() => handleSelectLevel(level.level)}
                                    style={{
                                        flex: "1 1 150px",
                                        background: isActive ? colors.pill : "#12141C",
                                        border: `1px solid ${
                                            isActive ? colors.border : "rgba(255,255,255,0.06)"
                                        }`,
                                        borderRadius: 8,
                                        padding: "12px 8px",
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            textTransform: "capitalize",
                                            color: isActive ? colors.text : "#7A7D8A",
                                        }}
                                    >
                                        {level.level.replace(/-/g, " ")}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 17,
                                            fontWeight: 700,
                                            marginTop: 3,
                                            color: isActive ? colors.accent : "#4A4D58",
                                        }}
                                    >
                                        {fmt(level.hourlyRate)}
                                        <span style={{ fontSize: 11, fontWeight: 500 }}>/hr</span>
                                    </div>
                                    <div style={{ fontSize: 10.5, color: "#484B58", marginTop: 2 }}>
                                        {level.estimatedHours.min}–{level.estimatedHours.max}h
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeRate && colors && (
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
                        4 — Estimated hours
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
                                fontSize: 24,
                                fontWeight: 700,
                                color: colors.accent,
                            }}
                        >
              {hours}h
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
                            value={hours}
                            onChange={(e) => setHours(parseFloat(e.target.value))}
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
                                border: "3px solid #0B0D13",
                                boxShadow: `0 0 12px ${colors.glow}`,
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
              {fmt(laborCost)}
            </span>
                    </div>
                </div>
            )}

            {activeRate && colors && (
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

                    <input
                        value={equipmentSearch}
                        onChange={(e) => setEquipmentSearch(e.target.value)}
                        placeholder="Search equipment"
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                            background: "#12141C",
                            color: "#E4E5EA",
                            fontSize: 13,
                            outline: "none",
                            boxSizing: "border-box",
                            marginBottom: 12,
                        }}
                    />

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
                            No equipment matches this selection.
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
                                                    {fmt(isSelected ? item.retailPrice * selected.qty : item.retailPrice)}
                                                </div>
                                                <div style={{ fontSize: 10, color: "#3A3D48" }}>
                                                    cost {fmt(item.baseCost)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {activeRate && colors && (
                <div
                    style={{
                        position: "sticky",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(to top, #0B0D13 80%, transparent)",
                        padding: "20px 20px 24px",
                        zIndex: 50,
                    }}
                >
                    <div
                        style={{
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: "16px 18px",
                        }}
                    >
                        {selectedCustomer && (
                            <div
                                style={{
                                    marginBottom: 8,
                                    paddingBottom: 8,
                                    borderBottom: `1px solid ${colors.border}`,
                                }}
                            >
                                <div style={{ fontSize: 12.5, color: "#7A7D8A" }}>Customer</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
                                    {selectedCustomer.name}
                                </div>
                                <div style={{ fontSize: 11.5, color: "#7A7D8A", marginTop: 2 }}>
                                    {selectedCustomer.address}
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, color: "#7A7D8A" }}>
                Labor — {selectedType} ({selectedLevel?.replace(/-/g, " ")}) · {hours}h ×{" "}
                  {fmt(activeRate.hourlyRate)}
              </span>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
                {fmt(laborCost)}
              </span>
                        </div>

                        {selectedEquipment.length > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, color: "#7A7D8A" }}>
                  Equipment (
                    {selectedEquipment.reduce((sum, item) => sum + item.qty, 0)} item
                    {selectedEquipment.reduce((sum, item) => sum + item.qty, 0) > 1 ? "s" : ""}
                    )
                </span>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
                  {fmt(equipmentCost)}
                </span>
                            </div>
                        )}

                        <div
                            style={{
                                borderTop: `1px solid ${colors.border}`,
                                marginTop: 8,
                                paddingTop: 10,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                            }}
                        >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#7A7D8A" }}>
                Estimated total
              </span>
                            <span
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: colors.accent,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                {fmt(totalCost)}
              </span>
                        </div>
                    </div>
                </div>
            )}

            {!selectedType && (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>👆</div>
                    <div style={{ fontSize: 14, color: "#484B58" }}>
                        Select a customer and service type to get started
                    </div>
                </div>
            )}
        </div>
    );
}