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

export default function EstimateQuoteDocument({
                                                  selectedCustomer,
                                                  serviceLinesWithCosts,
                                                  selectedEquipment,
                                                  equipmentCatalog,
                                                  laborCost,
                                                  equipmentCost,
                                                  totalCost,
                                              }) {
    const selectedEquipmentDetails = selectedEquipment
        .map((selected) => {
            const item = equipmentCatalog.find((eq) => eq.id === selected.id);
            if (!item) return null;

            return {
                ...item,
                qty: selected.qty,
                lineTotal: item.baseCost * selected.qty,
            };
        })
        .filter(Boolean);

    return (
        <div
            id="estimate-quote-document"
            style={{
                background: "#ffffff",
                color: "#111827",
                width: "800px",
                margin: "0 auto",
                padding: "32px",
                fontFamily: "Arial, Helvetica, sans-serif",
                lineHeight: 1.5,
            }}
        >
            <div style={{ marginBottom: 24 }}>
                <div
                    style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#6B7280",
                        marginBottom: 6,
                    }}
                >
                    HVAC Estimate
                </div>
                <h1
                    style={{
                        fontSize: 28,
                        margin: 0,
                        color: "#111827",
                    }}
                >
                    Field Estimate Summary
                </h1>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 8 }}>
                    Generated on {formatDate(new Date())}
                </div>
            </div>

            {selectedCustomer && (
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 16, marginBottom: 8 }}>Customer</h2>
                    <div><strong>Name:</strong> {selectedCustomer.name}</div>
                    <div><strong>Address:</strong> {selectedCustomer.address}</div>
                    <div><strong>Phone:</strong> {selectedCustomer.phone || "N/A"}</div>
                    <div><strong>Property Type:</strong> {selectedCustomer.propertyType}</div>
                    <div>
                        <strong>Square Footage:</strong>{" "}
                        {selectedCustomer.squareFootage
                            ? `${selectedCustomer.squareFootage.toLocaleString()} sq ft`
                            : "N/A"}
                    </div>
                    <div><strong>System Type:</strong> {selectedCustomer.systemType || "N/A"}</div>
                    <div>
                        <strong>System Age:</strong>{" "}
                        {selectedCustomer.systemAge != null
                            ? `${selectedCustomer.systemAge} years`
                            : "N/A"}
                    </div>
                    <div>
                        <strong>Last Service:</strong> {formatDate(selectedCustomer.lastServiceDate)}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, marginBottom: 8 }}>Services</h2>
                {serviceLinesWithCosts.length === 0 ? (
                    <div>No services selected.</div>
                ) : (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 14,
                        }}
                    >
                        <thead>
                        <tr>
                            <th style={thStyle}>Service</th>
                            <th style={thStyle}>Level</th>
                            <th style={thStyle}>Hours</th>
                            <th style={thStyle}>Rate</th>
                            <th style={thStyle}>Line Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {serviceLinesWithCosts.map((line, index) => (
                            <tr key={line.id}>
                                <td style={tdStyle}>{line.type || `Service ${index + 1}`}</td>
                                <td style={tdStyle}>
                                    {line.level ? line.level.replace(/-/g, " ") : "N/A"}
                                </td>
                                <td style={tdStyle}>{line.hours}</td>
                                <td style={tdStyle}>
                                    {line.activeRate ? fmt(line.activeRate.hourlyRate) : "N/A"}
                                </td>
                                <td style={tdStyle}>{fmt(line.laborCost)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, marginBottom: 8 }}>Equipment</h2>
                {selectedEquipmentDetails.length === 0 ? (
                    <div>No equipment selected.</div>
                ) : (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 14,
                        }}
                    >
                        <thead>
                        <tr>
                            <th style={thStyle}>Equipment</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Qty</th>
                            <th style={thStyle}>Unit Cost</th>
                            <th style={thStyle}>Line Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedEquipmentDetails.map((item) => (
                            <tr key={item.id}>
                                <td style={tdStyle}>{item.name}</td>
                                <td style={tdStyle}>{item.category}</td>
                                <td style={tdStyle}>{item.qty}</td>
                                <td style={tdStyle}>{fmt(item.baseCost)}</td>
                                <td style={tdStyle}>{fmt(item.lineTotal)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div
                style={{
                    marginTop: 24,
                    borderTop: "2px solid #E5E7EB",
                    paddingTop: 16,
                    width: "320px",
                    marginLeft: "auto",
                    fontSize: 14,
                }}
            >
                <div style={totalRowStyle}>
                    <span>Labor Subtotal</span>
                    <strong>{fmt(laborCost)}</strong>
                </div>
                <div style={totalRowStyle}>
                    <span>Equipment Subtotal</span>
                    <strong>{fmt(equipmentCost)}</strong>
                </div>
                <div
                    style={{
                        ...totalRowStyle,
                        fontSize: 18,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: "1px solid #D1D5DB",
                    }}
                >
                    <span>Estimated Total</span>
                    <strong>{fmt(totalCost)}</strong>
                </div>
            </div>
        </div>
    );
}

const thStyle = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #D1D5DB",
    color: "#374151",
};

const tdStyle = {
    padding: "10px 8px",
    borderBottom: "1px solid #E5E7EB",
    verticalAlign: "top",
};

const totalRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
};