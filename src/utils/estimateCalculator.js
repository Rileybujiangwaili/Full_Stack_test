export const MAJOR_EQUIPMENT_CATEGORIES = [
    "Air Conditioner",
    "Heat Pump",
    "Furnace",
    "Air Handler",
    "Mini-Split",
    "Rooftop Unit",
    "Package Unit",
    "Humidifier",
    "Air Cleaner",
    "Air Purifier",
];

export const SERVICE_EQUIPMENT_MAP = {
    diagnostic: [
        "Capacitor",
        "Motor",
        "Compressor",
        "Control Board",
        "Ignitor",
        "Coil",
        "Gas Valve",
        "Thermostat",
    ],
    repair: [
        "Capacitor",
        "Motor",
        "Compressor",
        "Control Board",
        "Ignitor",
        "Coil",
        "Gas Valve",
        "Thermostat",
    ],
    install: [
        "Air Conditioner",
        "Heat Pump",
        "Furnace",
        "Air Handler",
        "Mini-Split",
        "Rooftop Unit",
        "Package Unit",
        "Thermostat",
        "Humidifier",
        "Air Cleaner",
        "Air Purifier",
    ],
    maintenance: [
        "Capacitor",
        "Motor",
        "Ignitor",
        "Thermostat",
        "Humidifier",
        "Air Cleaner",
        "Air Purifier",
    ],
    ductwork: ["Humidifier", "Air Cleaner", "Air Purifier"],
};

export const INSTALL_LEVEL_FILTER = {
    residential: [
        "Air Conditioner",
        "Heat Pump",
        "Furnace",
        "Air Handler",
        "Thermostat",
        "Humidifier",
        "Air Cleaner",
        "Air Purifier",
    ],
    commercial: [
        "Air Conditioner",
        "Heat Pump",
        "Rooftop Unit",
        "Package Unit",
        "Thermostat",
        "Air Cleaner",
        "Air Purifier",
    ],
    "mini-split": ["Mini-Split", "Thermostat"],
};

export function addRetailPricing(equipmentList) {
    return equipmentList.map((item) => {
        const markup = MAJOR_EQUIPMENT_CATEGORIES.includes(item.category) ? 1.45 : 2.5;

        return {
            ...item,
            retailPrice: Math.round(item.baseCost * markup),
        };
    });
}

export function getServiceTypes(laborRates) {
    return [...new Set(laborRates.map((rate) => rate.jobType))];
}

export function getLevelsForType(laborRates, selectedType) {
    if (!selectedType) return [];
    return laborRates.filter((rate) => rate.jobType === selectedType);
}

export function getActiveRate(laborRates, selectedType, selectedLevel) {
    if (!selectedType || !selectedLevel) return null;

    return (
        laborRates.find(
            (rate) => rate.jobType === selectedType && rate.level === selectedLevel
        ) ?? null
    );
}

export function getRelevantEquipment({
                                         equipment,
                                         selectedType,
                                         selectedLevel,
                                         searchQuery,
                                         customer,
                                     }) {
    if (!selectedType) return [];

    let allowedCategories = SERVICE_EQUIPMENT_MAP[selectedType] ?? [];

    if (
        selectedType === "install" &&
        selectedLevel &&
        INSTALL_LEVEL_FILTER[selectedLevel]
    ) {
        allowedCategories = INSTALL_LEVEL_FILTER[selectedLevel];
    }

    let filtered = equipment.filter((item) =>
        allowedCategories.includes(item.category)
    );

    if (customer?.systemType) {
        const system = customer.systemType.toLowerCase();

        filtered = [...filtered].sort((a, b) => {
            const aMatch =
                system.includes(a.category.toLowerCase()) ||
                a.name.toLowerCase().includes(system);

            const bMatch =
                system.includes(b.category.toLowerCase()) ||
                b.name.toLowerCase().includes(system);

            return Number(bMatch) - Number(aMatch);
        });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
        filtered = filtered.filter((item) => {
            return (
                item.name.toLowerCase().includes(q) ||
                item.brand.toLowerCase().includes(q) ||
                item.modelNumber.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q)
            );
        });
    }

    return filtered;
}

export function groupEquipmentByCategory(equipmentList) {
    const grouped = {};

    for (const item of equipmentList) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    }

    return grouped;
}

export function calculateEquipmentCost(selectedEquipment, equipmentCatalog) {
    return selectedEquipment.reduce((sum, selected) => {
        const item = equipmentCatalog.find((eq) => eq.id === selected.id);
        if (!item) return sum;

        return sum + item.retailPrice * selected.qty;
    }, 0);
}

export function calculateLaborCost(activeRate, hours) {
    if (!activeRate || hours == null) return 0;
    return activeRate.hourlyRate * hours;
}

export function calculateEstimateTotal({ selectedEquipment, equipmentCatalog, activeRate, hours }) {
    const laborCost = calculateLaborCost(activeRate, hours);
    const equipmentCost = calculateEquipmentCost(selectedEquipment, equipmentCatalog);

    return {
        laborCost,
        equipmentCost,
        totalCost: laborCost + equipmentCost,
    };
}