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

export default function PropertyDetailsCard({ selectedCustomer }) {
    if (!selectedCustomer) return null;

    return (
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
    );
}