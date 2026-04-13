import { useMemo, useState } from "react";
import rawCustomers from "../data/customers.json";
import rawEquipment from "../data/equipment.json";
import rawLaborRates from "../data/labor_rates.json";
import EstimateQuoteDocument from "./EstimateQuoteDocument";

import {
    normalizeCustomers,
    normalizeEquipmentList,
    normalizeLaborRates,
} from "../utils/normalizeData";

import {
    calculateEstimateTotal,
    calculateServiceLines,
    getEquipmentCategories,
    getRelevantEquipment,
    groupEquipmentByCategory,
    getServiceTypes,
} from "../utils/estimateCalculator";

import CustomerSelector from "./CustomerSelector";
import PropertyDetailsCard from "./PropertyDetailsCard";
import ServiceLineCard from "./ServiceLineCard";
import EquipmentSelector from "./EquipmentSelector";
import EstimateSummary from "./EstimateSummary";

const CUSTOMERS = normalizeCustomers(rawCustomers);
const LABOR_RATES = normalizeLaborRates(rawLaborRates);
const EQUIPMENT = normalizeEquipmentList(rawEquipment);

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

function createEmptyServiceLine() {
    return {
        id: crypto.randomUUID(),
        type: "",
        level: "",
        hours: 0,
    };
}

export default function FieldEstimateTool() {
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [serviceLines, setServiceLines] = useState([createEmptyServiceLine()]);

    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [equipmentSearch, setEquipmentSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

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

    const serviceLinesWithCosts = useMemo(() => {
        return calculateServiceLines(serviceLines, LABOR_RATES);
    }, [serviceLines]);

    const equipmentCategories = useMemo(() => {
        return getEquipmentCategories(EQUIPMENT);
    }, []);

    const relevantEquipment = useMemo(() => {
        return getRelevantEquipment({
            equipment: EQUIPMENT,
            searchQuery: equipmentSearch,
            selectedCategory,
        });
    }, [equipmentSearch, selectedCategory]);

    const equipmentByCategory = useMemo(() => {
        return groupEquipmentByCategory(relevantEquipment);
    }, [relevantEquipment]);

    const { laborCost, equipmentCost, totalCost } = useMemo(() => {
        return calculateEstimateTotal({
            serviceLinesWithCosts,
            selectedEquipment,
            equipmentCatalog: EQUIPMENT,
        });
    }, [serviceLinesWithCosts, selectedEquipment]);

    const activeSummaryColor =
        serviceLinesWithCosts.find((line) => line.type)?.type ?? null;
    const summaryColors = activeSummaryColor ? TYPE_COLORS[activeSummaryColor] : null;

    function addServiceLine() {
        setServiceLines((prev) => [...prev, createEmptyServiceLine()]);
    }

    function removeServiceLine(id) {
        setServiceLines((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((line) => line.id !== id);
        });
    }

    function updateServiceLine(id, updates) {
        setServiceLines((prev) =>
            prev.map((line) => (line.id === id ? { ...line, ...updates } : line))
        );
    }

    function handleUpdateType(id, type) {
        const firstRate = LABOR_RATES.find((rate) => rate.jobType === type);

        updateServiceLine(id, {
            type,
            level: firstRate ? firstRate.level : "",
            hours: firstRate ? firstRate.estimatedHours.min : 0,
        });
    }

    function handleUpdateLevel(id, level) {
        const line = serviceLines.find((item) => item.id === id);
        const rate =
            LABOR_RATES.find(
                (item) => item.jobType === line?.type && item.level === level
            ) ?? null;

        updateServiceLine(id, {
            level,
            hours: rate ? rate.estimatedHours.min : 0,
        });
    }

    function handleUpdateHours(id, hours) {
        updateServiceLine(id, { hours });
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
                maxWidth: 720,
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
                    Select a customer, add one or more service lines, add equipment, and
                    generate a clean on-site estimate.
                </p>
            </div>

            <CustomerSelector
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                filteredCustomers={filteredCustomers}
                selectedCustomerId={selectedCustomerId}
                setSelectedCustomerId={setSelectedCustomerId}
            />

            <PropertyDetailsCard selectedCustomer={selectedCustomer} />

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
                    2 — Services
                </div>

                {serviceLinesWithCosts.map((line, index) => (
                    <ServiceLineCard
                        key={line.id}
                        index={index}
                        line={line}
                        laborRates={LABOR_RATES}
                        serviceTypes={serviceTypes}
                        colorsMap={TYPE_COLORS}
                        onUpdateType={handleUpdateType}
                        onUpdateLevel={handleUpdateLevel}
                        onUpdateHours={handleUpdateHours}
                        onRemove={removeServiceLine}
                        canRemove={serviceLinesWithCosts.length > 1}
                    />
                ))}

                <button
                    onClick={addServiceLine}
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px dashed rgba(255,255,255,0.14)",
                        background: "#12141C",
                        color: "#E4E5EA",
                        cursor: "pointer",
                        fontWeight: 600,
                        marginTop: 4,
                    }}
                >
                    + Add another service
                </button>
            </div>

            <EquipmentSelector
                activeRate={serviceLinesWithCosts.length > 0}
                colors={summaryColors || TYPE_COLORS.diagnostic}
                equipmentSearch={equipmentSearch}
                setEquipmentSearch={setEquipmentSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                equipmentCategories={equipmentCategories}
                equipmentByCategory={equipmentByCategory}
                selectedEquipment={selectedEquipment}
                toggleEquipment={toggleEquipment}
                updateQty={updateQty}
            />

            <div
                style={{
                    position: "absolute",
                    left: "-99999px",
                    top: 0,
                }}
            >
                <EstimateQuoteDocument
                    selectedCustomer={selectedCustomer}
                    serviceLinesWithCosts={serviceLinesWithCosts.filter((line) => line.type)}
                    selectedEquipment={selectedEquipment}
                    equipmentCatalog={EQUIPMENT}
                    laborCost={laborCost}
                    equipmentCost={equipmentCost}
                    totalCost={totalCost}
                />
            </div>

            <EstimateSummary
                colors={summaryColors || TYPE_COLORS.diagnostic}
                selectedCustomer={selectedCustomer}
                serviceLinesWithCosts={serviceLinesWithCosts.filter((line) => line.type)}
                equipmentCost={equipmentCost}
                selectedEquipment={selectedEquipment}
                equipmentCatalog={EQUIPMENT}
                totalCost={totalCost}
                laborCost={laborCost}
            />
        </div>
    );
}