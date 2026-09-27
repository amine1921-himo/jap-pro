const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("japPro", {
    getProducts: () => ipcRenderer.invoke("get-products"),

    addProduct: (product) => ipcRenderer.invoke("add-product", product),

    updateProduct: (product) => ipcRenderer.invoke("update-product", product),

    deleteProduct: (id) => ipcRenderer.invoke("delete-product", id)
});
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require("./database");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,

       webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: false
}
    });

    win.loadFile("index.html");
}


// جلب كل المنتجات
ipcMain.handle("get-products", () => {
    return db.prepare(`
        SELECT *
        FROM products
        ORDER BY id DESC
    `).all();
});


// إضافة منتج
ipcMain.handle("add-product", (event, product) => {
    const statement = db.prepare(`
        INSERT INTO products
        (name, category, quantity, unit, location, min_quantity)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
        product.name,
        product.category || "",
        Number(product.quantity) || 0,
        product.unit || "Pièce",
        product.location || "",
        Number(product.min_quantity) || 0
    );

    return {
        success: true,
        id: result.lastInsertRowid
    };
});


// تعديل منتج
ipcMain.handle("update-product", (event, product) => {
    db.prepare(`
        UPDATE products
        SET
            name = ?,
            category = ?,
            quantity = ?,
            unit = ?,
            location = ?,
            min_quantity = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        product.name,
        product.category || "",
        Number(product.quantity) || 0,
        product.unit || "Pièce",
        product.location || "",
        Number(product.min_quantity) || 0,
        product.id
    );

    return {
        success: true
    };
});


// حذف منتج
ipcMain.handle("delete-product", (event, id) => {
    db.prepare(`
        DELETE FROM products
        WHERE id = ?
    `).run(id);

    return {
        success: true
    };
});


app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
