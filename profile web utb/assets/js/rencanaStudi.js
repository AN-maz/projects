// js/rencanaStudi.js [VERSI FINAL - SEMUA DESKTOP MULTI-KOLOM]

/**
 * FUNGSI 1: Membuat Tampilan Desktop untuk SEMUA ITEM (Multi-Kolom)
 */
function createDesktopColumnView(itemData) {
    // Wrapper .table-container sekarang ada di sini untuk konsistensi
    return `<div class="table-container">${itemData.konten.map(tabel => `
        <div class="table-column">
            ${tabel.subjudul ? `<h3 class="semester-title">${tabel.subjudul}</h3>` : ''}
            <table class="study-plan-table">
                <thead>
                    <tr class="column-header">
                        <th>Mata Kuliah</th>
                        <th class="sks-column">SKS</th>
                    </tr>
                </thead>
                <tbody>
                    ${tabel.matkul.map(mk => `
                        <tr>
                            <td>${mk.nama}</td>
                            <td class="sks-column">${mk.sks}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `).join('')}</div>`;
}

/**
 * FUNGSI 2: Membuat Tampilan MOBILE untuk SEMUA ITEM (Tumpuk ke Bawah dengan Header)
 */
function createMobileView(itemData) {
    let mobileTablesHTML = '';
    itemData.konten.forEach(kolom => {
        mobileTablesHTML += `
            <div>
                <h3 class="semester-title">${kolom.subjudul}</h3>
                <div class="mobile-table-header">
                    <span>Mata Kuliah</span>
                    <span>SKS</span>
                </div>
                <table class="study-plan-table">
                    <tbody>
                        ${kolom.matkul.map(mk => `
                            <tr>
                                <td data-label="sks" data-matkul="${mk.nama}">${mk.sks}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    // Wrapper .semester-table-container sekarang ada di sini
    return `<div class="semester-table-container">${mobileTablesHTML}</div>`;
}


/**
 * FUNGSI RENDER UTAMA
 * Logika disederhanakan kembali, tidak ada if/else. Semua item diperlakukan sama.
 */
function renderAccordion(rencanaStudiData) {
    const container = document.getElementById('accordion-container');
    if (!container) return;

    container.innerHTML = '';

    rencanaStudiData.forEach(itemData => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        const desktopViewHTML = createDesktopColumnView(itemData);
        const mobileViewHTML = createMobileView(itemData);
        
        // Gabungkan kedua versi
        const contentHTML = `
            <div class="desktop-only">${desktopViewHTML}</div>
            <div class="mobile-only">${mobileViewHTML}</div>
        `;
        
        accordionItem.innerHTML = `
            <button class="accordion-header">
                ${itemData.judul}
                <span class="icon"></span>
            </button>
            <div class="accordion-content">
                ${contentHTML}
            </div>
        `;
        container.appendChild(accordionItem);
    });

    const allHeaders = container.querySelectorAll('.accordion-header');
    allHeaders.forEach(button => {
        button.addEventListener('click', () => {
            const currentlyActive = button.classList.contains('active');
            allHeaders.forEach(header => {
                header.classList.remove('active');
                header.nextElementSibling.style.maxHeight = null;
            });
            if (!currentlyActive) {
                button.classList.add('active');
                const content = button.nextElementSibling;
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + "px";
                }, 500);
            }
        });
    });
}


async function muatDanTampilkanRencanaStudi() {
    try {
        const response = await fetch('/assets/data/rencanaStudi.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        renderAccordion(data);
    } catch (error) {
        console.error("Gagal memuat data rencana studi:", error);
        const container = document.getElementById('accordion-container');
        if (container) container.innerHTML = '<p style="color: red;">Maaf, terjadi kesalahan saat memuat data.</p>';
    }
}

document.addEventListener('DOMContentLoaded', muatDanTampilkanRencanaStudi);