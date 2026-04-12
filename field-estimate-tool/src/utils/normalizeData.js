export function normalizeCustomer(raw) {
    return {
        id: raw.id,
        name: raw.name ?? "Unknown Customer",
        address: raw.address ?? "",
        phone: raw.phone ?? "",
        propertyType: raw.propertyType ?? raw.property_type ?? "unknown",
        squareFootage: raw.squareFootage ?? raw.sqft ?? null,
        systemType: raw.systemType ?? "",
        systemAge: raw.systemAge ?? null,
        lastServiceDate: raw.lastServiceDate ?? null,
    };
}

export function normalizeEquipment(raw) {
    return {
        id: raw.id,
        name: raw.name ?? "Unknown Item",
        category: raw.category ?? "Other",
        brand: raw.brand ?? "",
        modelNumber: raw.modelNumber ?? "",
        baseCost: Number(raw.baseCost ?? raw.base_cost ?? 0),
    };
}

export function normalizeLaborRate(raw) {
    return {
        jobType: raw.jobType ?? "",
        level: raw.level ?? "",
        hourlyRate: Number(raw.hourlyRate ?? 0),
        estimatedHours: {
            min: Number(raw.estimatedHours?.min ?? 0),
            max: Number(raw.estimatedHours?.max ?? 0),
        },
    };
}

export function normalizeCustomers(rawCustomers) {
    return rawCustomers.map(normalizeCustomer);
}

export function normalizeEquipmentList(rawEquipment) {
    return rawEquipment.map(normalizeEquipment);
}

export function normalizeLaborRates(rawLaborRates) {
    return rawLaborRates.map(normalizeLaborRate);
}