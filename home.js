function exportToExcel() {
    let items = localStorage.getItem('myPricelist') ? JSON.parse(localStorage.getItem('myPricelist')) : [];
    
    if (items.length === 0) {
        alert("Walang laman ang iyong listahan.");
        return;
    }

    // Gawaing Header ng CSV
    let csvContent = "data:text/csv;charset=utf-8,Produkto,Presyo\n";

    // Idagdag ang bawat item sa CSV rows
    items.forEach(item => {
        csvContent += `${item.name},${item.price}\n`;
    });

    // Pag-generate ng download link
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Aking_Pricelist.csv");
    document.body.appendChild(link);

    link.click(); // Ito ang magti-trigger ng download
    document.body.removeChild(link);
}
