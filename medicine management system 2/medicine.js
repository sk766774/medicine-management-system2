/* =====================================================
   MEDICINE MANAGEMENT SYSTEM
   Developed using HTML, CSS and JavaScript
   Storage: Browser LocalStorage
   ===================================================== */


/* =====================================================
   SECTION 1: BASIC CONFIGURATION
   ===================================================== */

const STORAGE_KEY = "medicine_management_system_data_v1";

const $ = (id) => document.getElementById(id);


/* =====================================================
   SECTION 2: DATE FUNCTIONS
   ===================================================== */

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getDateAfterDays(days) {
    const date = new Date();

    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {
    if (!dateString) {
        return "Not available";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) {
        return null;
    }

    const expiry = new Date(expiryDate + "T00:00:00");
    const today = new Date(getTodayDate() + "T00:00:00");

    if (Number.isNaN(expiry.getTime())) {
        return null;
    }

    return Math.round(
        (expiry.getTime() - today.getTime()) / 86400000
    );
}


/* =====================================================
   SECTION 3: DEMO MEDICINE DATA
   ===================================================== */

function createDemoMedicines() {
    return [
        {
            id: "MED-1001",
            name: "Demo Vitamin Tablet",
            category: "Tablet",
            company: "Wellness Demo Co.",
            batch: "VT-001",
            quantity: 42,
            reorder: 10,
            expiry: getDateAfterDays(220),
            price: 4.50,
            notes: "Fictional student-project record"
        },

        {
            id: "MED-1002",
            name: "Demo Cough Syrup",
            category: "Syrup",
            company: "Care Sample Ltd.",
            batch: "CS-014",
            quantity: 7,
            reorder: 12,
            expiry: getDateAfterDays(120),
            price: 85,
            notes: "Fictional student-project record"
        },

        {
            id: "MED-1003",
            name: "Demo First Aid Cream",
            category: "First Aid",
            company: "Health Demo",
            batch: "FA-200",
            quantity: 0,
            reorder: 8,
            expiry: getDateAfterDays(400),
            price: 55,
            notes: "Sample record for stock alerts"
        },

        {
            id: "MED-1004",
            name: "Demo Calcium Capsule",
            category: "Capsule",
            company: "Wellness Demo Co.",
            batch: "CC-101",
            quantity: 25,
            reorder: 10,
            expiry: getDateAfterDays(18),
            price: 6,
            notes: "Fictional student-project record"
        },

        {
            id: "MED-1005",
            name: "Demo ORS Sachet",
            category: "Other",
            company: "Care Sample Ltd.",
            batch: "OR-077",
            quantity: 15,
            reorder: 10,
            expiry: getDateAfterDays(-4),
            price: 22,
            notes: "Expired sample for alert demonstration"
        }
    ];
}


/* =====================================================
   SECTION 4: LOAD AND SAVE DATA
   ===================================================== */

function loadMedicines() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData !== null) {
            const parsedData = JSON.parse(savedData);

            if (Array.isArray(parsedData)) {
                return parsedData;
            }
        }
    } catch (error) {
        console.error("Unable to load saved data:", error);
    }

    return createDemoMedicines();
}


let medicines = loadMedicines();


function saveMedicines() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(medicines)
        );

        return true;

    } catch (error) {
        console.error("Unable to save data:", error);

        showToast(
            "Data could not be saved. Browser storage may be unavailable."
        );

        return false;
    }
}


/* =====================================================
   SECTION 5: SAFE HTML TEXT
   ===================================================== */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}


/* =====================================================
   SECTION 6: MEDICINE STATUS FUNCTIONS
   ===================================================== */

function getStockStatus(medicine) {
    const quantity = Number(medicine.quantity);
    const reorder = Number(medicine.reorder);

    if (quantity <= 0) {
        return "Out of Stock";
    }

    if (quantity <= reorder) {
        return "Low Stock";
    }

    return "In Stock";
}


function getExpiryStatus(medicine) {
    const days = getDaysUntilExpiry(medicine.expiry);

    if (days === null) {
        return "Invalid Date";
    }

    if (days < 0) {
        return "Expired";
    }

    if (days <= 30) {
        return "Expiring Soon";
    }

    return "Valid";
}


function createStatusBadge(status) {
    let className = "status-good";

    switch (status) {
        case "In Stock":
        case "Valid":
            className = "status-good";
            break;

        case "Low Stock":
            className = "status-low";
            break;

        case "Out of Stock":
        case "Expired":
            className = "status-out";
            break;

        case "Expiring Soon":
            className = "status-soon";
            break;

        default:
            className = "status-low";
    }

    return `
        <span class="status ${className}">
            ${escapeHTML(status)}
        </span>
    `;
}


/* =====================================================
   SECTION 7: TOAST NOTIFICATIONS
   ===================================================== */

let toastTimeout;


function showToast(message) {
    const toast = $("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove("show");
    }, 2800);
}


/* =====================================================
   SECTION 8: DASHBOARD STATISTICS
   ===================================================== */

function calculateStatistics() {
    const totalMedicines = medicines.length;

    const totalStock = medicines.reduce(function (total, medicine) {
        return total + Number(medicine.quantity || 0);
    }, 0);

    const lowStock = medicines.filter(function (medicine) {
        return getStockStatus(medicine) !== "In Stock";
    }).length;

    const expiryCount = medicines.filter(function (medicine) {
        const status = getExpiryStatus(medicine);

        return status === "Expired" ||
               status === "Expiring Soon";
    }).length;

    return {
        totalMedicines,
        totalStock,
        lowStock,
        expiryCount
    };
}


function updateDashboardStatistics() {
    const stats = calculateStatistics();

    $("totalMedicines").textContent = stats.totalMedicines;
    $("totalStock").textContent = stats.totalStock;
    $("lowStock").textContent = stats.lowStock;
    $("expiryCount").textContent = stats.expiryCount;
}


/* =====================================================
   SECTION 9: RECENT MEDICINES
   ===================================================== */

function renderRecentMedicines() {
    const tbody = $("recentMedicines");

    const recent = [...medicines]
        .slice(-5)
        .reverse();

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4">
                    No medicine records available.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = recent.map(function (medicine) {
        return `
            <tr>
                <td>
                    <span class="medicine-name">
                        ${escapeHTML(medicine.name)}
                    </span>

                    <span class="subtext">
                        ${escapeHTML(medicine.id)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(medicine.category)}
                </td>

                <td>
                    ${Number(medicine.quantity)}
                </td>

                <td>
                    ${createStatusBadge(getStockStatus(medicine))}
                </td>
            </tr>
        `;
    }).join("");
}


/* =====================================================
   SECTION 10: DASHBOARD ALERTS
   ===================================================== */

function renderDashboardAlerts() {
    const container = $("dashboardAlerts");

    const alerts = [];

    medicines.forEach(function (medicine) {
        const stockStatus = getStockStatus(medicine);
        const expiryStatus = getExpiryStatus(medicine);

        if (stockStatus !== "In Stock") {
            alerts.push({
                name: medicine.name,
                message: stockStatus +
                    " — " + medicine.quantity + " units",
                type: "stock"
            });
        }

        if (
            expiryStatus === "Expired" ||
            expiryStatus === "Expiring Soon"
        ) {
            alerts.push({
                name: medicine.name,
                message: expiryStatus +
                    " — " + formatDate(medicine.expiry),
                type: "expiry"
            });
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="alert-item">
                <span class="alert-dot"></span>

                <div>
                    <strong>All clear</strong>
                    <p>No current demo alerts.</p>
                </div>
            </div>
        `;

        return;
    }

    container.innerHTML = alerts.slice(0, 7).map(function (alert) {
        return `
            <div class="alert-item">
                <span class="alert-dot"></span>

                <div>
                    <strong>${escapeHTML(alert.name)}</strong>

                    <p>${escapeHTML(alert.message)}</p>
                </div>
            </div>
        `;
    }).join("");
}


/* =====================================================
   SECTION 11: SEARCH AND FILTER
   ===================================================== */

function getFilteredMedicines() {
    const search = $("searchMedicine").value
        .trim()
        .toLowerCase();

    const category = $("categoryFilter").value;
    const stockStatus = $("stockFilter").value;

    return medicines.filter(function (medicine) {
        const searchableText = [
            medicine.id,
            medicine.name,
            medicine.category,
            medicine.company,
            medicine.batch
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(search);

        const matchesCategory =
            !category || medicine.category === category;

        const matchesStock =
            !stockStatus ||
            getStockStatus(medicine) === stockStatus;

        return matchesSearch &&
               matchesCategory &&
               matchesStock;
    });
}


/* =====================================================
   SECTION 12: RENDER INVENTORY TABLE
   ===================================================== */

function renderMedicineTable() {
    const tbody = $("medicineTable");

    const filteredMedicines = getFilteredMedicines();

    $("noResults").classList.toggle(
        "hidden",
        filteredMedicines.length !== 0
    );

    if (filteredMedicines.length === 0) {
        tbody.innerHTML = "";
        return;
    }

    tbody.innerHTML = filteredMedicines.map(function (medicine) {
        const stockStatus = getStockStatus(medicine);
        const expiryStatus = getExpiryStatus(medicine);

        return `
            <tr>
                <td>
                    <span class="medicine-name">
                        ${escapeHTML(medicine.name)}
                    </span>

                    <span class="subtext">
                        ${escapeHTML(medicine.id)}
                        · Batch ${escapeHTML(medicine.batch || "—")}
                    </span>
                </td>

                <td>
                    ${escapeHTML(medicine.category)}
                </td>

                <td>
                    ${escapeHTML(medicine.company || "—")}
                </td>

                <td>
                    <strong>${Number(medicine.quantity)}</strong>

                    <span class="subtext">
                        Reorder: ${Number(medicine.reorder)}
                    </span>
                </td>

                <td>
                    ${formatDate(medicine.expiry)}

                    <span class="subtext">
                        ${createStatusBadge(expiryStatus)}
                    </span>
                </td>

                <td>
                    ${createStatusBadge(stockStatus)}
                </td>

                <td>
                    <div class="action-group">

                        <button
                            class="action-btn"
                            data-edit="${escapeHTML(medicine.id)}">
                            Edit
                        </button>

                        <button
                            class="action-btn delete"
                            data-delete="${escapeHTML(medicine.id)}">
                            Delete
                        </button>

                    </div>
                </td>
            </tr>
        `;
    }).join("");
}


/* =====================================================
   SECTION 13: OPEN ADD MEDICINE FORM
   ===================================================== */

function openAddMedicineForm() {
    $("medicineForm").reset();

    $("medicineId").value = "";

    $("dialogHeading").textContent = "Add New Medicine";

    $("medicineQuantity").value = 0;
    $("medicineReorder").value = 10;
    $("medicinePrice").value = 0;
    $("medicineExpiry").value = getDateAfterDays(180);

    $("medicineDialog").showModal();
}


/* =====================================================
   SECTION 14: OPEN EDIT MEDICINE FORM
   ===================================================== */

function openEditMedicineForm(id) {
    const medicine = medicines.find(function (item) {
        return item.id === id;
    });

    if (!medicine) {
        showToast("Medicine record not found.");
        return;
    }

    $("medicineId").value = medicine.id;

    $("medicineName").value = medicine.name;
    $("medicineCategory").value = medicine.category;
    $("medicineCompany").value = medicine.company || "";
    $("medicineBatch").value = medicine.batch || "";

    $("medicineQuantity").value = medicine.quantity;
    $("medicineReorder").value = medicine.reorder;
    $("medicineExpiry").value = medicine.expiry;

    $("medicinePrice").value = medicine.price ?? 0;
    $("medicineNotes").value = medicine.notes || "";

    $("dialogHeading").textContent = "Edit Medicine";

    $("medicineDialog").showModal();
}


function closeMedicineDialog() {
    $("medicineDialog").close();
}


/* =====================================================
   SECTION 15: VALIDATE MEDICINE FORM
   ===================================================== */

function validateMedicineForm() {
    const name = $("medicineName").value.trim();
    const category = $("medicineCategory").value;
    const expiry = $("medicineExpiry").value;

    const quantity = Number($("medicineQuantity").value);
    const reorder = Number($("medicineReorder").value);
    const price = Number($("medicinePrice").value || 0);

    if (!name) {
        showToast("Please enter the medicine name.");
        return false;
    }

    if (!category) {
        showToast("Please select a medicine category.");
        return false;
    }

    if (!expiry || Number.isNaN(new Date(expiry).getTime())) {
        showToast("Please enter a valid expiry date.");
        return false;
    }

    if (
        $("medicineQuantity").value === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {
        showToast("Quantity must be a non-negative whole number.");
        return false;
    }

    if (
        $("medicineReorder").value === "" ||
        !Number.isInteger(reorder) ||
        reorder < 0
    ) {
        showToast("Reorder level must be a non-negative whole number.");
        return false;
    }

    if (!Number.isFinite(price) || price < 0) {
        showToast("Please enter a valid unit price.");
        return false;
    }

    return true;
}


/* =====================================================
   SECTION 16: CREATE OR UPDATE MEDICINE
   ===================================================== */

function handleMedicineFormSubmit(event) {
    event.preventDefault();

    if (!validateMedicineForm()) {
        return;
    }

    const existingId = $("medicineId").value;

    const medicine = {
        id: existingId ||
            "MED-" + Date.now().toString().slice(-8),

        name: $("medicineName").value.trim(),

        category: $("medicineCategory").value,

        company: $("medicineCompany").value.trim(),

        batch: $("medicineBatch").value.trim(),

        quantity: Number($("medicineQuantity").value),

        reorder: Number($("medicineReorder").value),

        expiry: $("medicineExpiry").value,

        price: Number($("medicinePrice").value || 0),

        notes: $("medicineNotes").value.trim()
    };

    const existingIndex = medicines.findIndex(function (item) {
        return item.id === existingId && existingId !== "";
    });

    if (existingIndex >= 0) {
        const oldMedicine = medicines[existingIndex];

        medicines[existingIndex] = {
            ...oldMedicine,
            ...medicine
        };
    } else {
        medicines.push(medicine);
    }

    if (!saveMedicines()) {
        return;
    }

    refreshApplication();

    closeMedicineDialog();

    if (existingIndex >= 0) {
        showToast("Medicine updated successfully.");
    } else {
        showToast("Medicine added successfully.");
    }
}


/* =====================================================
   SECTION 17: DELETE MEDICINE
   ===================================================== */

function deleteMedicine(id) {
    const medicine = medicines.find(function (item) {
        return item.id === id;
    });

    if (!medicine) {
        showToast("Medicine not found.");
        return;
    }

    const confirmed = confirm(
        'Are you sure you want to delete "' +
        medicine.name +
        '" from the browser demo?'
    );

    if (!confirmed) {
        return;
    }

    const previousData = medicines;

    medicines = medicines.filter(function (item) {
        return item.id !== id;
    });

    if (!saveMedicines()) {
        medicines = previousData;
        return;
    }

    refreshApplication();

    showToast("Medicine deleted successfully.");
}


/* =====================================================
   SECTION 18: STOCK ALERTS
   ===================================================== */

function renderStockAlerts() {
    const container = $("stockAlerts");

    const alerts = medicines.filter(function (medicine) {
        return getStockStatus(medicine) !== "In Stock";
    });

    if (alerts.length === 0) {
        container.innerHTML = "<p>No stock alerts found.</p>";
        return;
    }

    container.innerHTML = alerts.map(function (medicine) {
        return `
            <div class="alert-row">

                <div>
                    <strong>${escapeHTML(medicine.name)}</strong>

                    <small>
                        Available: ${Number(medicine.quantity)}
                        units · Reorder level:
                        ${Number(medicine.reorder)}
                    </small>
                </div>

                ${createStatusBadge(getStockStatus(medicine))}

            </div>
        `;
    }).join("");
}


/* =====================================================
   SECTION 19: EXPIRY ALERTS
   ===================================================== */

function renderExpiryAlerts() {
    const container = $("expiryAlerts");

    const alerts = medicines.filter(function (medicine) {
        const status = getExpiryStatus(medicine);

        return status === "Expired" ||
               status === "Expiring Soon";
    });

    if (alerts.length === 0) {
        container.innerHTML = "<p>No expiry alerts found.</p>";
        return;
    }

    container.innerHTML = alerts.map(function (medicine) {
        return `
            <div class="alert-row">

                <div>
                    <strong>${escapeHTML(medicine.name)}</strong>

                    <small>
                        Expiry: ${formatDate(medicine.expiry)}
                    </small>
                </div>

                ${createStatusBadge(getExpiryStatus(medicine))}

            </div>
        `;
    }).join("");
}


/* =====================================================
   SECTION 20: REPORT SUMMARY
   ===================================================== */

function renderReportSummary() {
    const container = $("reportSummary");

    const stats = calculateStatistics();

    const estimatedValue = medicines.reduce(
        function (total, medicine) {
            return total +
                Number(medicine.quantity || 0) *
                Number(medicine.price || 0);
        },
        0
    );

    const formattedValue = estimatedValue.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

    container.innerHTML = `
        <div class="report-box">
            <span>Total Medicine Records</span>
            <strong>${stats.totalMedicines}</strong>
        </div>

        <div class="report-box">
            <span>Total Stock Units</span>
            <strong>${stats.totalStock}</strong>
        </div>

        <div class="report-box">
            <span>Estimated Stock Value</span>
            <strong>₹${formattedValue}</strong>
        </div>
    `;
}


/* =====================================================
   SECTION 21: EXPORT MEDICINES TO CSV
   ===================================================== */

function exportMedicinesToCSV() {
    if (medicines.length === 0) {
        showToast("No medicine records available to export.");
        return;
    }

    const fields = [
        "id",
        "name",
        "category",
        "company",
        "batch",
        "quantity",
        "reorder",
        "expiry",
        "price",
        "notes"
    ];

    function csvCell(value) {
        const text = String(value ?? "");

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const header = fields.map(csvCell).join(",");

    const rows = medicines.map(function (medicine) {
        return fields.map(function (field) {
            return csvCell(medicine[field]);
        }).join(",");
    });

    const csvContent = [
        header,
        ...rows
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "medicine-inventory.csv";

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 1000);

    showToast("CSV report download started.");
}


/* =====================================================
   SECTION 22: RESET DEMO DATA
   ===================================================== */

function resetDemoData() {
    const confirmed = confirm(
        "Reset the browser demo inventory to the original sample data? " +
        "Your current demo records will be replaced."
    );

    if (!confirmed) {
        return;
    }

    const previousData = medicines;

    medicines = createDemoMedicines();

    if (!saveMedicines()) {
        medicines = previousData;
        return;
    }

    refreshApplication();

    showToast("Demo data has been reset.");
}


/* =====================================================
   SECTION 23: NAVIGATION
   ===================================================== */

function switchView(viewName) {
    const validViews = [
        "dashboard",
        "inventory",
        "alerts",
        "reports"
    ];

    if (!validViews.includes(viewName)) {
        return;
    }

    document.querySelectorAll(".view").forEach(function (view) {
        view.classList.add("hidden");
    });

    const selectedView = $(viewName + "View");

    if (selectedView) {
        selectedView.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-btn").forEach(
        function (button) {
            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        }
    );

    const titles = {
        dashboard: "Dashboard",
        inventory: "Medicine Inventory",
        alerts: "Stock & Expiry Alerts",
        reports: "Inventory Reports"
    };

    $("pageTitle").textContent = titles[viewName];

    if (viewName === "inventory") {
        renderMedicineTable();
    }

    if (viewName === "alerts") {
        renderStockAlerts();
        renderExpiryAlerts();
    }

    if (viewName === "reports") {
        renderReportSummary();
    }
}


/* =====================================================
   SECTION 24: REFRESH THE APPLICATION
   ===================================================== */

function refreshApplication() {
    updateDashboardStatistics();

    renderRecentMedicines();

    renderDashboardAlerts();

    renderMedicineTable();

    renderStockAlerts();

    renderExpiryAlerts();

    renderReportSummary();
}


/* =====================================================
   SECTION 25: EVENT LISTENERS
   ===================================================== */

// Add medicine buttons
$("addMedicineBtn").addEventListener(
    "click",
    openAddMedicineForm
);

$("addMedicineBtn2").addEventListener(
    "click",
    openAddMedicineForm
);


// Dialog buttons
$("closeDialog").addEventListener(
    "click",
    closeMedicineDialog
);

$("cancelDialog").addEventListener(
    "click",
    closeMedicineDialog
);


// Medicine form submission
$("medicineForm").addEventListener(
    "submit",
    handleMedicineFormSubmit
);


// Search and filters
$("searchMedicine").addEventListener(
    "input",
    renderMedicineTable
);

$("categoryFilter").addEventListener(
    "change",
    renderMedicineTable
);

$("stockFilter").addEventListener(
    "change",
    renderMedicineTable
);


// Inventory edit and delete buttons
$("medicineTable").addEventListener(
    "click",
    function (event) {
        const editButton = event.target.closest("[data-edit]");

        const deleteButton = event.target.closest("[data-delete]");

        if (editButton) {
            openEditMedicineForm(editButton.dataset.edit);
        }

        if (deleteButton) {
            deleteMedicine(deleteButton.dataset.delete);
        }
    }
);


// Sidebar navigation
document.querySelectorAll(".nav-btn").forEach(
    function (button) {
        button.addEventListener("click", function () {
            switchView(button.dataset.view);
        });
    }
);


// View all inventory button
document.querySelectorAll("[data-goto]").forEach(
    function (button) {
        button.addEventListener("click", function () {
            switchView(button.dataset.goto);
        });
    }
);


// CSV export
$("exportCSV").addEventListener(
    "click",
    exportMedicinesToCSV
);


// Print report
$("printReport").addEventListener(
    "click",
    function () {
        window.print();
    }
);


// Reset sample data
$("resetData").addEventListener(
    "click",
    resetDemoData
);


/* =====================================================
   SECTION 26: CURRENT DATE
   ===================================================== */

function displayCurrentDate() {
    const today = new Date();

    $("currentDate").textContent = today.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   SECTION 27: APPLICATION INITIALISATION
   ===================================================== */

function initialiseApplication() {
    displayCurrentDate();

    refreshApplication();

    console.log(
        "Medicine Management System initialized successfully."
    );

    console.log(
        "Total medicine records:",
        medicines.length
    );
}


// Start application
initialiseApplication();