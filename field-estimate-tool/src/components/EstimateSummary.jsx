import html2pdf from "html2pdf.js";

function fmt(n) {
    return "$" + Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

export default function EstimateSummary({
                                            colors,
                                            selectedCustomer,
                                            serviceLinesWithCosts,
                                            equipmentCost,
                                            selectedEquipment,
                                            equipmentCatalog,
                                            totalCost,
                                            laborCost,
                                        }) {
    if (!serviceLinesWithCosts.length || !colors) return null;

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

    async function handleCopySummary() {
        const serviceText = serviceLinesWithCosts
            .map((line, index) => {
                const levelText = line.level ? ` (${line.level.replace(/-/g, " ")})` : "";
                return `Service ${index + 1}: ${line.type}${levelText} - ${line.hours}h - ${fmt(line.laborCost)}`;
            })
            .join("\n");

        const equipmentText =
            selectedEquipmentDetails.length > 0
                ? selectedEquipmentDetails
                    .map(
                        (item) => `- ${item.name} x${item.qty} - ${fmt(item.lineTotal)}`
                    )
                    .join("\n")
                : "No equipment selected";

        const summaryText = `Customer: ${selectedCustomer?.name ?? "N/A"}
Address: ${selectedCustomer?.address ?? "N/A"}

Services
${serviceText}

Equipment
${equipmentText}

Labor subtotal: ${fmt(laborCost)}
Equipment subtotal: ${fmt(equipmentCost)}
Estimated total: ${fmt(totalCost)}`;

        try {
            await navigator.clipboard.writeText(summaryText);
            alert("Estimate summary copied.");
        } catch {
            alert("Copy failed. Please try again.");
        }
    }

    function handleExportPDF() {
        const element = document.getElementById("estimate-quote-document");
        if (!element) {
            alert("PDF content not found.");
            return;
        }

        const fileName = selectedCustomer?.name
            ? `estimate-${selectedCustomer.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
            : "estimate.pdf";

        html2pdf()
            .set({
                margin: 0.5,
                filename: fileName,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            })
            .from(element)
            .save();
    }

    return (
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

                {serviceLinesWithCosts.map((line, index) => (
                    <div
                        key={line.id}
                        style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
                    >
            <span style={{ fontSize: 12.5, color: "#7A7D8A" }}>
              Service {index + 1} — {line.type || "Unselected"}{" "}
                {line.level ? `(${line.level.replace(/-/g, " ")})` : ""} · {line.hours}h
            </span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
              {fmt(line.laborCost)}
            </span>
                    </div>
                ))}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 6,
                        marginBottom: selectedEquipmentDetails.length > 0 ? 10 : 4,
                    }}
                >
                    <span style={{ fontSize: 12.5, color: "#7A7D8A" }}>Labor subtotal</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
            {fmt(laborCost)}
          </span>
                </div>

                {selectedEquipmentDetails.length > 0 && (
                    <>
                        <div
                            style={{
                                fontSize: 12.5,
                                color: "#7A7D8A",
                                marginBottom: 6,
                                marginTop: 2,
                            }}
                        >
                            Equipment
                        </div>

                        {selectedEquipmentDetails.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: 12,
                                    marginBottom: 4,
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            color: colors.text,
                                            fontWeight: 500,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#7A7D8A",
                                            marginTop: 1,
                                        }}
                                    >
                                        Qty {item.qty} · {item.category}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: colors.text,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {fmt(item.lineTotal)}
                                </div>
                            </div>
                        ))}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 8,
                                marginBottom: 4,
                            }}
                        >
              <span style={{ fontSize: 12.5, color: "#7A7D8A" }}>
                Equipment subtotal
              </span>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: colors.text }}>
                {fmt(equipmentCost)}
              </span>
                        </div>
                    </>
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

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 14,
                    }}
                >
                    <button
                        onClick={handleCopySummary}
                        style={buttonStyle}
                    >
                        Copy Summary
                    </button>

                    <button
                        onClick={handleExportPDF}
                        style={buttonStyle}
                    >
                        Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

const buttonStyle = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#12141C",
    color: "#E4E5EA",
    cursor: "pointer",
    fontWeight: 600,
};