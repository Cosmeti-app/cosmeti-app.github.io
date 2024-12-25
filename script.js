const elements = {
  skinFileInput: document.getElementById("skinFile"),
  dropZone: document.getElementById("dropZone"),
  editorFrame: document.getElementById("editor-frame"),
  previewButton: document.getElementById("previewButton"),
  searchInput: document.getElementById("searchInput"),
  partList: document.getElementById("partList"),
  skinCanvas: document.getElementById("skinCanvas"),
  downloadButton: document.getElementById("downloadButton"),
  navbar: document.getElementById("navbar"),
  reloadButton: document.getElementById("reloadButton"),
  modal: document.getElementById("templateModal"),
  link: document.getElementById("viewTemplatesLink"),
  closeBtn: document.getElementsByClassName("close-btn")[0],
  imageGrid: document.querySelector(".image-grid"),
  toggleView: document.getElementById("toggleView"),
};


elements.toggleView.addEventListener("change", () => {
  filterPartsByView();
});

function filterPartsByView() {
  const view = elements.toggleView.value;
  document.querySelectorAll(".part-item").forEach((partItem) => {
    const partTitle = partItem.querySelector(".part-title").textContent;
    if ((view === "wide" && partTitle.includes("Slim")) || (view === "slim" && partTitle.includes("Wide"))) {
      partItem.style.display = "none";
    } else {
      partItem.style.display = "block";
    }
  });
}

const ctx = elements.skinCanvas.getContext("2d");
let uploadedSkin = null;
let skinUploaded = false;
let selectedParts = new Set();

elements.reloadButton.addEventListener("click", () => location.reload());

elements.dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  elements.dropZone.classList.add("dragover");
});

elements.dropZone.addEventListener("dragleave", () => {
  elements.dropZone.classList.remove("dragover");
});

elements.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  handleFileUpload(file);
});

elements.skinFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  handleFileUpload(file);
});

function handleFileUpload(file) {
  if (file && file.type === "image/png") {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedSkin = new Image();
      uploadedSkin.crossOrigin = "anonymous";
      uploadedSkin.src = event.target.result;
      uploadedSkin.onload = () => {
        revealElements();
        setCanvasSize(uploadedSkin);
        ctx.drawImage(uploadedSkin, 0, 0);
        skinUploaded = true;
        updateSkinViewer();
      };
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please upload a valid PNG file.");
  }
}

function revealElements() {
  elements.searchInput.classList.remove("hidden");
  elements.partList.classList.remove("hidden");
  elements.previewButton.classList.remove("hidden");
  elements.downloadButton.classList.remove("hidden");
  document.querySelector(".drop-zone").classList.add("hidden");
  document.querySelector(".templateText").classList.add("hidden");
  elements.navbar.classList.remove("hidden");
}

function setCanvasSize(image) {
  elements.skinCanvas.width = image.width;
  elements.skinCanvas.height = image.height;
}

function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous";
  skinImage.src = skinUrl;
  skinImage.onload = () => {
    setCanvasSize(skinImage);
    ctx.clearRect(0, 0, elements.skinCanvas.width, elements.skinCanvas.height);
    ctx.drawImage(skinImage, 0, 0);
    updateSkinViewer();
    skinUploaded = true;
  };
}

function overlayPartOnSkin(partUrl) {
  if (!skinUploaded) {
    alert("Please upload a skin first.");
    return;
  }
  const partImage = new Image();
  partImage.crossOrigin = "anonymous";
  partImage.src = partUrl;
  partImage.onload = () => {
    ctx.drawImage(partImage, 0, 0);
    updateSkinViewer();
  };
}

function redrawSkin() {
  ctx.clearRect(0, 0, elements.skinCanvas.width, elements.skinCanvas.height);
  if (uploadedSkin) ctx.drawImage(uploadedSkin, 0, 0);
  selectedParts.forEach((partUrl) => {
    const partImage = new Image();
    partImage.crossOrigin = "anonymous";
    partImage.src = partUrl;
    partImage.onload = () => ctx.drawImage(partImage, 0, 0);
  });
  updateSkinViewer();
}

document.querySelectorAll(".part-icon").forEach((partIcon) => {
  partIcon.addEventListener("click", function () {
    const partUrl = this.dataset.partUrl;
    if (selectedParts.has(partUrl)) {
      selectedParts.delete(partUrl);
    } else {
      selectedParts.add(partUrl);
    }
    redrawSkin();
  });
});

let skinViewer = new skinview3d.SkinViewer({
  canvas: document.getElementById("skin_container"),
  width: 200,
  height: 400,
  skin: elements.skinCanvas.toDataURL("image/png"),
});

function updateSkinViewerSize() {
  const container = document.getElementById("skin_container");
  skinViewer.width = container.clientWidth;
  skinViewer.height = container.clientHeight;
}

updateSkinViewerSize();
window.addEventListener("resize", updateSkinViewerSize);

skinViewer.fov = 70;
skinViewer.zoom = 0.7;
skinViewer.animation = new skinview3d.WalkingAnimation();

function updateSkinViewer() {
  skinViewer.loadSkin(elements.skinCanvas.toDataURL("image/png"));
}

function checkAndMakeTransparent() {
  const imageData = ctx.getImageData(0, 0, elements.skinCanvas.width, elements.skinCanvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 105 && data[i + 1] === 118 && data[i + 2] === 74 && data[i + 3] === 255) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  updateSkinViewer();
}

setInterval(checkAndMakeTransparent, 1000);

function downloadSkin() {
  const skinDataURL = elements.skinCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = skinDataURL;
  link.download = "Cosmeti-Skin.png";
  link.click();
}

elements.downloadButton.addEventListener("click", downloadSkin);

async function fetchAuthorLinks() {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?sheet=AuthorData&tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]);
    const authorLinks = {};
    jsonData.table.rows.forEach((row) => {
      const author = row.c[0]?.v;
      const link = row.c[1]?.v;
      if (author && link) {
        authorLinks[author] = link;
      }
    });
    return authorLinks;
  } catch (error) {
    console.error("Error fetching author links:", error);
    return {};
  }
}

// Utility functions for caching
function saveToCache(key, data) {
  const expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  const cacheData = { data, expirationTime };
  localStorage.setItem(key, JSON.stringify(cacheData));
}

function getFromCache(key) {
  const cacheData = JSON.parse(localStorage.getItem(key));
  if (cacheData && cacheData.expirationTime > Date.now()) {
    return cacheData.data;
  } else {
    localStorage.removeItem(key);
    return null;
  }
}

// Modified fetchClothingData function
async function fetchClothingData(query = "") {
  try {
    const authorLinks = await fetchAuthorLinks();
    const cacheKey = `clothingData_${query}`;
    let clothingParts;
    filterPartsByView();

    // Fetch the latest clothing data from the server
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]);
    const latestClothingParts = jsonData.table.rows;

    // Get the cached data
    const cachedData = getFromCache(cacheKey);

    // Compare the latest data with the cached data
    if (JSON.stringify(latestClothingParts) !== JSON.stringify(cachedData)) {
      // Update local storage if there are new skins
      saveToCache(cacheKey, latestClothingParts);
      clothingParts = latestClothingParts;
    } else {
      clothingParts = cachedData;
    }

    elements.partList.innerHTML = "";
    clothingParts.forEach((part) => {
      const name = part.c[3]?.v;
      const author = part.c[4]?.v;
      const icon = part.c[1]?.v;
      const file = part.c[5]?.v;
      const tags = part.c[0]?.v;
      if (name && author && icon && file && (name.toLowerCase().includes(query.toLowerCase()) || author.toLowerCase().includes(query.toLowerCase()) || (tags && tags.toLowerCase().includes(query.toLowerCase())))) {
        const partItem = document.createElement("div");
        partItem.classList.add("part-item");
        let authorHtml;
        if (author === "Partner") {
          authorHtml = `<div class="part-author" style="color: yellow;">${author}</div>`;
        } else {
          const authorLink = authorLinks[author] || "#";
          authorHtml = `<div class="part-author"><a href="${authorLink}" target="_blank">${author}</a></div>`;
        }
        partItem.innerHTML = `<img src="${icon}" alt="${name}"><div class="part-title">${name}</div>${authorHtml}`;
        elements.partList.appendChild(partItem);
        partItem.addEventListener("click", () => {
          if (!skinUploaded) {
            alert("Please upload a skin first.");
            return;
          }
          if (selectedParts.has(file)) {
            partItem.classList.remove("selected");
            selectedParts.delete(file);
            redrawSkin();
          } else {
            overlayPartOnSkin(file);
            partItem.classList.add("selected");
            selectedParts.add(file);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching clothing data:", error);
  }
}

elements.searchInput.addEventListener("input", (event) => {
  const query = event.target.value;
  fetchClothingData(query);
});

fetchClothingData();

elements.previewButton.addEventListener("click", () => {
  const skinDataURL = elements.skinCanvas.toDataURL("image/png");
  elements.editorFrame.classList.remove("hidden");
  elements.editorFrame.src = `https://web.blockbench.net/?open=${skinDataURL}`;
  elements.editorFrame.style.display = "block";
});

document.addEventListener("DOMContentLoaded", () => {
  elements.searchInput.classList.add("hidden");
  elements.partList.classList.add("hidden");
  fetchTemplateImages();
});

elements.link.onclick = (e) => {
  e.preventDefault();
  elements.modal.style.display = "block";
};

elements.closeBtn.onclick = () => {
  elements.modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target == elements.modal) {
    elements.modal.style.display = "none";
  }
}

// Modified fetchTemplateImages function
async function fetchTemplateImages() {
  try {
    const cacheKey = "templateImages";
    let templateImages;

    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      templateImages = cachedData;
    } else {
      const response = await fetch(
        "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?sheet=SkinTemplates&tqx=out:json"
      );
      const data = await response.text();
      const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]);
      templateImages = jsonData.table.rows;
      saveToCache(cacheKey, templateImages);
    }

    elements.imageGrid.innerHTML = "";
    templateImages.forEach((row) => {
      const imageUrl = row.c[0]?.v;
      const skinUrl = row.c[1]?.v;
      if (imageUrl && skinUrl) {
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Template Image";
        imgElement.classList.add("template-icon");
        imgElement.dataset.skinUrl = skinUrl;
        imgElement.addEventListener("click", () => {
          downloadTemplate(skinUrl);
        });
        elements.imageGrid.appendChild(imgElement);
      }
    });
  } catch (error) {
    console.error("Error fetching template images:", error);
  }
}

async function downloadTemplate(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "Cosmeti-Template.png";
    link.click();
    URL.revokeObjectURL(blobUrl); // Clean up the URL object
  } catch (error) {
    console.error("Error downloading template:", error);
  }
}

function unselectPart(partUrl) {
  selectedParts.delete(partUrl);
  redrawSkin();
}

elements.partList.addEventListener("click", (event) => {
  const part = event.target.dataset.part;
  if (part) {
    unselectPart(part);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key === "R") {
    localStorage.clear();
    location.reload();
  }
});