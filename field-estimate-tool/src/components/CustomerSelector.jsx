export default function CustomerSelector({
                                             customerSearch,
                                             setCustomerSearch,
                                             filteredCustomers,
                                             selectedCustomerId,
                                             setSelectedCustomerId,
                                         }) {
    return (
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
    );
}