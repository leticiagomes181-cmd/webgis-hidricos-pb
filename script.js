// Inicializa o mapa centralizado na Paraíba (zoom 7)
const map = L.map('mapa').setView([-7.115, -36.720], 7);

// Mapa de fundo (Basemap do OpenStreetMap)
const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cria a caixinha de controle de camadas no canto superior direito
const controleCamadas = L.control.layers({"Mapa Base": openStreetMap}, {}).addTo(map);

// 🎨 ESTILOS DAS CAMADAS
const estiloMunicipios = { color: "#666666", weight: 1, fillOpacity: 0 }; // Borda cinza, sem preenchimento
const estiloBacias = { color: "#2E8B57", weight: 2, fillOpacity: 0.1 }; // Borda verde escuro, fundo clarinho
const estiloRios = { color: "#1E90FF", weight: 1.5 }; // Linha azul
const estiloAcudes = { color: "#00008B", weight: 1, fillColor: "#4169E1", fillOpacity: 0.8 }; // Azul encorpado

// 💬 FUNÇÃO PARA OS POPUPS (Ao clicar no elemento)
function adicionarPopup(feature, layer) {
    let popupContent = "<div style='font-family: Arial; font-size: 14px;'><b>Detalhes:</b><hr style='margin: 5px 0;'>";
    // O código vai ler tudo que você deixou na tabela de atributos e colocar no balão
    if (feature.properties) {
        for (let prop in feature.properties) {
            popupContent += `<b>${prop}:</b> ${feature.properties[prop]}<br>`;
        }
    }
    popupContent += "</div>";
    layer.bindPopup(popupContent);
}

// 🚀 FUNÇÃO PRINCIPAL PARA LER E RENDERIZAR OS DADOS
async function carregarCamadas() {
    try {
        // 1. Carrega os Municípios
        const respMun = await fetch('dados/municipios.geojson');
        const dadosMun = await respMun.json();
        const camadaMun = L.geoJSON(dadosMun, { 
            style: estiloMunicipios, 
            onEachFeature: adicionarPopup 
        });
        controleCamadas.addOverlay(camadaMun, "Municípios");

        // 2. Carrega as Bacias Hidrográficas
        const respBacias = await fetch('dados/bacias.geojson');
        const dadosBacias = await respBacias.json();
        const camadaBacias = L.geoJSON(dadosBacias, { 
            style: estiloBacias, 
            onEachFeature: adicionarPopup 
        });
        controleCamadas.addOverlay(camadaBacias, "Bacias Hidrográficas");

        // 3. Carrega os Rios
        const respRios = await fetch('dados/rios.geojson');
        const dadosRios = await respRios.json();
        const camadaRios = L.geoJSON(dadosRios, { 
            style: estiloRios, 
            onEachFeature: adicionarPopup 
        });
        controleCamadas.addOverlay(camadaRios, "Rios");
        
        // 4. Carrega os Açudes
        const respAcudes = await fetch('dados/acudes.geojson');
        const dadosAcudes = await respAcudes.json();
        const camadaAcudes = L.geoJSON(dadosAcudes, { 
            style: estiloAcudes, 
            onEachFeature: adicionarPopup 
        });
        controleCamadas.addOverlay(camadaAcudes, "Açudes");

        // Já deixa os municípios e açudes ligados na tela por padrão
        camadaMun.addTo(map);
        camadaAcudes.addTo(map);
        
    } catch (erro) {
        console.error("Erro ao carregar os dados. Verifique os nomes dos arquivos.", erro);
    }
}

// Roda o sistema
carregarCamadas();
