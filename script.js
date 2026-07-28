// Inicializa o mapa centralizado na Paraíba (zoom 7)
const map = L.map('mapa').setView([-7.115, -36.720], 7);

// Mapa de fundo (Basemap do OpenStreetMap)
const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cria a caixinha de controle de camadas
const controleCamadas = L.control.layers({"Mapa Base": openStreetMap}, {}).addTo(map);

// Variável global para ser usada na pesquisa
let camadaMunicipiosGlobal;

// 🎨 ESTILOS DAS CAMADAS
const estiloMunicipios = { color: "#666666", weight: 1, fillOpacity: 0 }; 
const estiloBacias = { color: "#2E8B57", weight: 2, fillOpacity: 0.1 }; 
const estiloRios = { color: "#1E90FF", weight: 1.5 }; 
const estiloAcudes = { color: "#00008B", weight: 1, fillColor: "#4169E1", fillOpacity: 0.8 }; 
const estiloRodovias = { color: "#FF8C00", weight: 1.5, opacity: 0.8 };

// 💬 FUNÇÃO PARA OS POPUPS
function adicionarPopup(feature, layer) {
    let popupContent = "<div style='font-family: Arial; font-size: 14px;'><b>Detalhes:</b><hr style='margin: 5px 0;'>";
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
        // 1. Carrega os Municípios (agora na variável global)
        const respMun = await fetch('municipios.geojson');
        const dadosMun = await respMun.json();
        camadaMunicipiosGlobal = L.geoJSON(dadosMun, { style: estiloMunicipios, onEachFeature: adicionarPopup });
        controleCamadas.addOverlay(camadaMunicipiosGlobal, "Municípios");
        document.getElementById('total-mun').innerText = dadosMun.features.length;

        // 2. Carrega as Bacias Hidrográficas
        const respBacias = await fetch('bacias.geojson');
        const dadosBacias = await respBacias.json();
        const camadaBacias = L.geoJSON(dadosBacias, { style: estiloBacias, onEachFeature: adicionarPopup });
        controleCamadas.addOverlay(camadaBacias, "Bacias Hidrográficas");
        document.getElementById('total-bacias').innerText = dadosBacias.features.length;

        // 3. Carrega os Rios
        const respRios = await fetch('rios.geojson');
        const dadosRios = await respRios.json();
        const camadaRios = L.geoJSON(dadosRios, { style: estiloRios, onEachFeature: adicionarPopup });
        controleCamadas.addOverlay(camadaRios, "Rios");
        document.getElementById('total-rios').innerText = dadosRios.features.length;
        
        // 4. Carrega os Açudes
        const respAcudes = await fetch('acudes.geojson');
        const dadosAcudes = await respAcudes.json();
        const camadaAcudes = L.geoJSON(dadosAcudes, { style: estiloAcudes, onEachFeature: adicionarPopup });
        controleCamadas.addOverlay(camadaAcudes, "Açudes");
        document.getElementById('total-acudes').innerText = dadosAcudes.features.length;

        // 5. Carrega as Rodovias
        const respRodovias = await fetch('rodovias.geojson');
        const dadosRodovias = await respRodovias.json();
        const camadaRodovias = L.geoJSON(dadosRodovias, { style: estiloRodovias, onEachFeature: adicionarPopup });
        controleCamadas.addOverlay(camadaRodovias, "Rodovias");

        camadaMunicipiosGlobal.addTo(map);
        camadaAcudes.addTo(map);
        
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
    }
}

// 🔍 FUNÇÃO DE BUSCA DO MUNICÍPIO
function buscarMunicipio() {
    // Pega o texto digitado e converte para minúsculas
    const textoBusca = document.getElementById('input-busca').value.toLowerCase().trim();
    let encontrou = false;

    if (!camadaMunicipiosGlobal || textoBusca === "") return;

    // Varre todos os municípios no mapa
    camadaMunicipiosGlobal.eachLayer(function(layer) {
        // Atenção: Substitua "NM_MUN" se o campo do nome do município estiver diferente na sua tabela!
        const nomeMunicipio = layer.feature.properties.NM_MUN; 

        if (nomeMunicipio && nomeMunicipio.toLowerCase() === textoBusca) {
            map.fitBounds(layer.getBounds()); // Dá zoom no polígono do município
            layer.openPopup(); // Abre a janelinha com as informações
            encontrou = true;
        }
    });

    if (!encontrou) {
        alert("Município não encontrado! Verifique se a ortografia está correta (incluindo acentos).");
    }
}

carregarCamadas();
