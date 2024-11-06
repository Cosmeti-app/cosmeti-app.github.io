const skinFileInput = document.getElementById("skinFile");
const dropZone = document.getElementById("dropZone");
const editorFrame = document.getElementById("editor-frame");
const previewButton = document.getElementById("previewButton");
const searchInput = document.getElementById("searchInput");
const partList = document.getElementById("partList");
const skinCanvas = document.getElementById("skinCanvas");
const downloadButton = document.getElementById("downloadButton");
const navbar = document.getElementById("navbar");
const reloadButton = document.getElementById("reloadButton");
const ctx = skinCanvas.getContext("2d");
let uploadedSkin = null;
let skinUploaded = false;
let selectedParts = [];

// Reload button functionality
reloadButton.addEventListener("click", () => {
  location.reload();
});

// Drag and drop functionality
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type === "image/png") {
    handleFileUpload(file);
  } else {
    alert("Please upload a valid PNG file.");
  }
});

// File input change event
skinFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type === "image/png") {
    handleFileUpload(file);
  } else {
    alert("Please upload a valid PNG file.");
  }
});

// Function to handle file upload
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedSkin = new Image();
    uploadedSkin.crossOrigin = "anonymous";
    uploadedSkin.src = event.target.result;

    uploadedSkin.onload = function () {
      // Reveal the hidden elements
      searchInput.classList.remove("hidden");
      partList.classList.remove("hidden");
      previewButton.classList.remove("hidden");
      downloadButton.classList.remove("hidden");
      document.querySelector(".drop-zone").classList.add("hidden");
      document.querySelector(".templateText").classList.add("hidden");
      navbar.classList.remove("hidden");

      // Set canvas size to match skin
      skinCanvas.width = uploadedSkin.width;
      skinCanvas.height = uploadedSkin.height;

      // Draw uploaded skin onto canvas
      ctx.drawImage(uploadedSkin, 0, 0);

      // Set the flag to indicate that a skin has been uploaded
      skinUploaded = true;

      // Update SkinViewer skin
      updateSkinViewer();
    };
  };
  reader.readAsDataURL(file);
}

// Function to update skinCanvas with the selected skin URL
function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous";
  skinImage.src = skinUrl;

  skinImage.onload = function () {
    // Set canvas size to match skin
    skinCanvas.width = skinImage.width;
    skinCanvas.height = skinImage.height;

    // Draw the new skin onto the canvas
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
    ctx.drawImage(skinImage, 0, 0, skinCanvas.width, skinCanvas.height);

    // Update SkinViewer skin
    updateSkinViewer();

    // Set the flag to indicate that a skin has been uploaded
    skinUploaded = true;
  };
}

// Function to overlay part on the skin
function overlayPartOnSkin(partUrl) {
  if (!skinUploaded) {
    alert("Please upload a skin first.");
    return;
  }

  const partImage = new Image();
  partImage.crossOrigin = "anonymous";
  partImage.src = partUrl;

  partImage.onload = function () {
    ctx.drawImage(partImage, 0, 0);
    updateSkinViewer();
  };
}

function redrawSkin() {
  // Clear the canvas
  ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);

  // Debugging logs
  console.log("Redrawing skin...");
  console.log("Uploaded skin:", uploadedSkin);
  console.log("Selected parts:", selectedParts);

  // Draw the uploaded skin first
  if (uploadedSkin) {
    ctx.drawImage(uploadedSkin, 0, 0);
  }

  // Draw each selected part in the order they were added
  selectedParts.forEach(partUrl => {
    const partImage = new Image();
    partImage.crossOrigin = "anonymous";
    partImage.src = partUrl;
    partImage.onload = function () {
      ctx.drawImage(partImage, 0, 0);
    };
  });

  // Update the SkinViewer
  updateSkinViewer();
}

// Part selection logic
document.querySelectorAll(".part-icon").forEach(partIcon => {
  partIcon.addEventListener("click", function () {
    const partUrl = this.dataset.partUrl;
    const partIndex = selectedParts.indexOf(partUrl);

    if (partIndex === -1) {
      // Part is not selected, add it
      selectedParts.push(partUrl);
    } else {
      // Part is already selected, remove it
      selectedParts.splice(partIndex, 1);
    }

    // Redraw the skin with the updated parts list
    redrawSkin();
  });
});

// Initialize SkinViewer
let skinViewer = new skinview3d.SkinViewer({
  canvas: document.getElementById("skin_container"),
  width: 200,
  height: 400,
  skin: skinCanvas.toDataURL("image/png"),
});

// Set initial size based on container size
function updateSkinViewerSize() {
  const container = document.getElementById("skin_container");
  skinViewer.width = container.clientWidth;
  skinViewer.height = container.clientHeight;
}

updateSkinViewerSize();
window.addEventListener("resize", updateSkinViewerSize);

// Change camera FOV and zoom
skinViewer.fov = 70;
skinViewer.zoom = 0.7;
skinViewer.animation = new skinview3d.WalkingAnimation();

// Function to update SkinViewer skin
function updateSkinViewer() {
  skinViewer.loadSkin(skinCanvas.toDataURL("image/png"));
}

// Function to check and make pixels with color #69764a transparent
function checkAndMakeTransparent() {
  const imageData = ctx.getImageData(0, 0, skinCanvas.width, skinCanvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (r === 105 && g === 118 && b === 74 && a === 255) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  updateSkinViewer();
}

setInterval(checkAndMakeTransparent, 1000);

// Function to download the current state of the canvas
function downloadSkin() {
  const skinDataURL = skinCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = skinDataURL;
  link.download = "Cosmeti-Skin.png";
  link.click();
}

downloadButton.addEventListener("click", downloadSkin);

// Function to filter and display parts based on search query
async function fetchClothingData(query = "") {
  const selectedParts = new Set();

  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]);

    const clothingParts = jsonData.table.rows;
    partList.innerHTML = "";

    clothingParts.forEach((part) => {
      const name = part.c[3]?.v;
      const author = part.c[4]?.v;
      const icon = part.c[1]?.v;
      const file = part.c[5]?.v;
      const tags = part.c[0]?.v;

      if (name && author && icon && file) {
        if (
          name.toLowerCase().includes(query.toLowerCase()) ||
          author.toLowerCase().includes(query.toLowerCase()) ||
          (tags && tags.toLowerCase().includes(query.toLowerCase()))
        ) {
          const partItem = document.createElement("div");
          partItem.classList.add("part-item");
          partItem.innerHTML = `
            <img src="${icon}" alt="${name}">
            <div class="part-title">${name}</div>
            <div class="part-author">${author}</div>
          `;
          partList.appendChild(partItem);

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
      }
    });
  } catch (error) {
    console.error("Error fetching clothing data:", error);
  }
}

searchInput.addEventListener("input", (event) => {
  const query = event.target.value;
  fetchClothingData(query);
});

fetchClothingData();

// Preview button functionality
previewButton.addEventListener("click", () => {
  const skinDataURL = skinCanvas.toDataURL("image/png");
  editorFrame.classList.remove("hidden");
  editorFrame.src = `https://web.blockbench.net/?open=${skinDataURL}`;
  editorFrame.style.display = "block";
});

// Ensure the DOM is fully loaded before handling file uploads
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("searchInput").classList.add("hidden");
  document.getElementById("partList").classList.add("hidden");
  fetchTemplateImages();
});

// Modal functionality
const modal = document.getElementById("templateModal");
const link = document.getElementById("viewTemplatesLink");
const closeBtn = document.getElementsByClassName("close-btn")[0];

link.onclick = function (e) {
  e.preventDefault();
  modal.style.display = "block";
};

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Fetch template images from Google Sheets
async function fetchTemplateImages() {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?sheet=SkinTemplates&tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]);

    const templateImages = jsonData.table.rows;
    const imageGrid = document.querySelector(".image-grid");
    imageGrid.innerHTML = "";

    templateImages.forEach((row) => {
      const imageUrl = row.c[0]?.v;
      const skinUrl = row.c[1]?.v;

      if (imageUrl && skinUrl) {
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Template Image";
        imgElement.classList.add("template-icon");
        imgElement.dataset.skinUrl = skinUrl;

        imgElement.addEventListener("click", function () {
          updateSkinCanvas(skinUrl);
          modal.style.display = "none";
          document.querySelector(".drop-zone").classList.add("hidden");
          document.querySelector(".templateText").classList.add("hidden");
          document.querySelector(".download-btn").classList.remove("hidden");
          document.querySelector(".preview-btn").classList.remove("hidden");
        });
        skinUploaded = true;
        imageGrid.appendChild(imgElement);
      }
    });
  } catch (error) {
    console.error("Error fetching template images:", error);
  }
}

// Function to handle part unselection
function unselectPart(partUrl) {
  // Remove the part from the selectedParts array
  selectedParts = selectedParts.filter(selectedPart => selectedPart !== partUrl);

  // Redraw the skin with the remaining selected parts
  redrawSkin();
}

// Example function to draw a part on the canvas
function drawPart(part) {
  // Logic to draw the part on the canvas
  // This is a placeholder function and should be implemented based on your specific requirements
}

// Add event listener for unselecting a part
partList.addEventListener("click", (event) => {
  const part = event.target.dataset.part;
  if (part) {
    unselectPart(part);
  }
});