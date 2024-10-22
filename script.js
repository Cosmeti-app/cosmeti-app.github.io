const skinFileInput = document.getElementById("skinFile");
const dropZone = document.getElementById("dropZone");
const editorFrame = document.getElementById("editor-frame");
const previewButton = document.getElementById("previewButton");
const searchInput = document.getElementById("searchInput");
const partList = document.getElementById("partList");
const skinCanvas = document.getElementById("skinCanvas");
const downloadButton = document.getElementById("downloadButton");
const navbar = document.getElementById("navbar");
const partItems = document.querySelectorAll(".part-item");
const ctx = skinCanvas.getContext("2d");
let uploadedSkin = null;
let skinUploaded = false;

const reloadButton = document.getElementById("reloadButton");

reloadButton.addEventListener("click", () => {
  location.reload();
});

document
  .getElementById("dropZone")
  .addEventListener("dragover", function (event) {
    event.preventDefault();
  });

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

document.getElementById("dropZone").addEventListener("drop", function (event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type === "image/png") {
    handleFileUpload(file);
  } else {
    alert("Please upload a valid PNG file.");
  }
});

// Function to update SkinViewer size based on window size
function updateSkinViewerSize() {
  const container = document.getElementById("skin_container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  skinViewer.width = width;
  skinViewer.height = height;
}

// Initialize SkinViewer
let skinViewer = new skinview3d.SkinViewer({
  canvas: document.getElementById("skin_container"),
  width: 200,
  height: 400,
  skin: skinCanvas.toDataURL("image/png")
});

// Set initial size based on container size
updateSkinViewerSize();

// Add event listener for window resize to update viewer size
window.addEventListener("resize", updateSkinViewerSize);

// Change camera FOV
skinViewer.fov = 70;

// Zoom out
skinViewer.zoom = 0.7;

// Apply an animation
skinViewer.animation = new skinview3d.WalkingAnimation();

// Function to update SkinViewer skin
function updateSkinViewer() {
  skinViewer.loadSkin(skinCanvas.toDataURL("image/png"));
}

// Event listener for file input
document
  .getElementById("skinFile")
  .addEventListener("change", function (event) {
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
    uploadedSkin.crossOrigin = "anonymous"; // Set crossOrigin attribute
    uploadedSkin.src = event.target.result;

    uploadedSkin.onload = function () {
      // Reveal the hidden elements
      searchInput.classList.remove("hidden");
      partList.classList.remove("hidden");
      previewButton.classList.remove("hidden");
      downloadButton.classList.remove("hidden");

      navbar.classList.remove("hidden");

      // Set canvas size to match skin
      skinCanvas.width = uploadedSkin.width;
      skinCanvas.height = uploadedSkin.height;

      // Draw uploaded skin onto canvas
      const ctx = skinCanvas.getContext("2d");
      ctx.drawImage(uploadedSkin, 0, 0);

      // Set the flag to indicate that a skin has been uploaded
      skinUploaded = true;

      // Update SkinViewer skin
      updateSkinViewer();
    };
  };
  reader.readAsDataURL(file);
}

// Ensure the parts selection menu is hidden initially
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").classList.add("hidden");
  document.getElementById("partList").classList.add("hidden");
});

// Function to overlay part on the skin
function overlayPartOnSkin(partUrl) {
  const partImage = new Image();
  partImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
  partImage.src = partUrl;

  partImage.onload = function () {
    const ctx = skinCanvas.getContext("2d");
    // Draw the part image on top of the existing skin image
    ctx.drawImage(partImage, 0, 0);

    // Update SkinViewer skin
    updateSkinViewer();
  };
}

// Function to download the current state of the canvas
function downloadSkin() {
  const skinDataURL = skinCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = skinDataURL;
  link.download = "Cosmeti-Skin.png";
  link.click();
}

// Add event listener to the download button
document
  .getElementById("downloadButton")
  .addEventListener("click", downloadSkin);

async function fetchClothingData() {
  const selectedParts = new Set(); // Set to keep track of selected parts

  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]); // Extract JSON safely

    const clothingParts = jsonData.table.rows;

    partList.innerHTML = "";

    clothingParts.forEach((part) => {
      const name = part.c[3]?.v;
      const author = part.c[4]?.v;
      const icon = part.c[1]?.v;
      const file = part.c[5]?.v; // Part PNG file

      if (name && author && icon && file) {
        const partItem = document.createElement("div");
        partItem.classList.add("part-item");
        partItem.innerHTML = `
          <img src="${icon}" alt="${name}">
          <div class="part-title">${name}</div>
          <div class="part-author">${author}</div>
        `;
        partList.appendChild(partItem);

        // On click, overlay the part onto the skin and update the selected parts
        partItem.addEventListener("click", () => {
          if (!skinUploaded) {
            alert("Please upload a skin first.");
            return;
          }

          if (selectedParts.has(file)) {
            // Unselect the part
            partItem.classList.remove("selected");
            selectedParts.delete(file);

            // Redraw the skin without the unselected part
            redrawSkin();
          } else {
            // Select the part
            overlayPartOnSkin(file);
            partItem.classList.add("selected");

            // Add the part to the set
            selectedParts.add(file);
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching clothing data:", error);
  }

  function redrawSkin() {
    // Clear the canvas
    const ctx = skinCanvas.getContext("2d");
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);

    // Redraw the base skin
    ctx.drawImage(uploadedSkin, 0, 0);

    // Redraw all selected parts
    selectedParts.forEach((partUrl) => {
      const partImage = new Image();
      partImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
      partImage.src = partUrl;
      partImage.onload = function () {
        ctx.drawImage(partImage, 0, 0);
      };
    });

    // Update SkinViewer skin
    updateSkinViewer();
  }
}

fetchClothingData();

// Preview button functionality: Opens Blockbench with the skin
previewButton.addEventListener("click", () => {
  const skinDataURL = skinCanvas.toDataURL("image/png");
  editorFrame.classList.remove("hidden");
  editorFrame.src = "https://web.blockbench.net/?open=${skinDataURL}";
  editorFrame.style.display = "block";
});

// Ensure the DOM is fully loaded before handling file uploads
document.addEventListener("DOMContentLoaded", function () {
  const skinViewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("skin_container"),
    width: 300,
    height: 400,
    skin: "https://example.com/path/to/skin.png" // Replace with your skin URL
  });

  // Your existing code for handling file uploads or other initializations
});
