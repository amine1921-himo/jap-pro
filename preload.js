const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("japPro", {
    getProducts: () => ipcRenderer.invoke("get-products"),

    addProduct: (product) => ipcRenderer.invoke("add-product", product),

    updateProduct: (product) => ipcRenderer.invoke("update-product", product),

    deleteProduct: (id) => ipcRenderer.invoke("delete-product", id)
});
