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

export function getEquipmentCategories(equipment) {
    return ["All", ...new Set(equipment.map((item) => item.category))];
}

export function getRelevantEquipment({
                                         equipment,
                                         searchQuery,
                                         selectedCategory,
                                     }) {
    let filtered = [...equipment];

    if (selectedCategory && selectedCategory !== "All") {
        filtered = filtered.filter((item) => item.category === selectedCategory);
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
        return sum + item.baseCost * selected.qty;
    }, 0);
}

export function calculateServiceLines(serviceLines, laborRates) {
    return serviceLines.map((line) => {
        const activeRate = getActiveRate(laborRates, line.type, line.level);
        const laborCost =
            activeRate && line.hours != null ? activeRate.hourlyRate * line.hours : 0;

        return {
            ...line,
            activeRate,
            laborCost,
        };
    });
}

export function calculateTotalLabor(serviceLinesWithCosts) {
    return serviceLinesWithCosts.reduce((sum, line) => sum + line.laborCost, 0);
}

export function calculateEstimateTotal({
                                           serviceLinesWithCosts,
                                           selectedEquipment,
                                           equipmentCatalog,
                                       }) {
    const laborCost = calculateTotalLabor(serviceLinesWithCosts);
    const equipmentCost = calculateEquipmentCost(selectedEquipment, equipmentCatalog);

    return {
        laborCost,
        equipmentCost,
        totalCost: laborCost + equipmentCost,
    };
}