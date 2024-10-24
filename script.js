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

// Function to update skinCanvas with the selected skin URL
function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
  skinImage.src = skinUrl;

  skinImage.onload = function () {
    // Set canvas size to match skin
    skinCanvas.width = skinImage.width;
    skinCanvas.height = skinImage.height;

    // Draw the new skin onto the canvas
    const ctx = skinCanvas.getContext("2d");
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height); // Clear the canvas
    ctx.drawImage(skinImage, 0, 0, skinCanvas.width, skinCanvas.height); // Draw the new skin

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

// Part selection logic
document.querySelectorAll(".part-icon").forEach((partIcon) => {
  partIcon.addEventListener("click", function () {
    const partUrl = this.dataset.partUrl;
    overlayPartOnSkin(partUrl);
  });
});

// Function to update SkinViewer size based on window size
function updateSkinViewerSize() {
  const container = document.getElementById("skin_container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  skinViewer.width = width;
  skinViewer.height = height;
}

// Function to overlay part on the skin
function overlayPartOnSkin(partUrl) {
  if (!skinUploaded) {
    alert("Please upload a skin first.");
    return;
  }

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

// Part selection logic
document.querySelectorAll(".part-icon").forEach((partIcon) => {
  partIcon.addEventListener("click", function () {
    const partUrl = this.dataset.partUrl;
    overlayPartOnSkin(partUrl);
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

// Function to update skinCanvas with the selected skin URL
function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
  skinImage.src = skinUrl;

  skinImage.onload = function () {
    // Set canvas size to match skin
    skinCanvas.width = skinImage.width;
    skinCanvas.height = skinImage.height;

    // Draw the new skin onto the canvas
    const ctx = skinCanvas.getContext("2d");
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height); // Clear the canvas
    ctx.drawImage(skinImage, 0, 0, skinCanvas.width, skinCanvas.height); // Draw the new skin

    // Update SkinViewer skin
    updateSkinViewer();

    // Set the flag to indicate that a skin has been uploaded
    skinUploaded = true;
  };
}

// Function to check and make pixels with color #69764a transparent
function checkAndMakeTransparent() {
  const ctx = skinCanvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, skinCanvas.width, skinCanvas.height);
  const data = imageData.data;

  // Loop through each pixel
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Check if the pixel color is exactly #69764a
    if (r === 105 && g === 118 && b === 74 && a === 255) {
      // Make the pixel transparent
      data[i + 3] = 0;
    }
  }

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Update SkinViewer skin
  updateSkinViewer();
}

// Set an interval to check the canvas every second (1000 milliseconds)
setInterval(checkAndMakeTransparent, 100);

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
      document.querySelector(".drop-zone").classList.add("hidden");
      document.querySelector(".templateText").classList.add("hidden");

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
  if (!skinUploaded) {
    alert("Please upload a skin first.");
    return;
  }

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

// Part selection logic
document.querySelectorAll(".part-icon").forEach((partIcon) => {
  partIcon.addEventListener("click", function () {
    const partUrl = this.dataset.partUrl;
    overlayPartOnSkin(partUrl);
  });
});

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
  const blockbenchURL = `https://web.blockbench.net/?open=${skinDataURL}`;
  window.open(blockbenchURL, '_blank');
});

// Ensure the DOM is fully loaded before handling file uploads
document.addEventListener("DOMContentLoaded", function () {
  // Your existing code for handling file uploads or other initializations
});

// Get the modal
var modal = document.getElementById("templateModal");

// Get the link that opens the modal
var link = document.getElementById("viewTemplatesLink");

// Get the <span> element that closes the modal
var closeBtn = document.getElementsByClassName("close-btn")[0];

// When the user clicks on the link, open the modal
link.onclick = function (e) {
  e.preventDefault(); // Prevent default anchor behavior
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
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
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]); // Extract JSON safely

    const templateImages = jsonData.table.rows;

    const imageGrid = document.querySelector(".image-grid");
    imageGrid.innerHTML = ""; // Clear any previous content

    // Loop through each row and get the image links from columns 1 and 2
    templateImages.forEach((row) => {
      const imageUrl = row.c[0]?.v; // Get the image URL from column 1
      if (imageUrl) {
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.classList.add("template-image");
        imgElement.onclick = function () {
          handleSkinUpload(imageUrl); // Call the skin upload function with the image URL
        };
        imageGrid.appendChild(imgElement);
      }
    });
  } catch (error) {
    console.error("Error fetching template images:", error);
  }
}

// Function to handle skin file upload
function handleSkinUpload(imageUrl) {
  // Your existing code for handling skin file upload
}

// Get the modal
var modal = document.getElementById("templateModal");

// Get the link that opens the modal
var link = document.getElementById("viewTemplatesLink");

// Get the <span> element that closes the modal
var closeBtn = document.getElementsByClassName("close-btn")[0];

// When the user clicks on the link, open the modal
link.onclick = function (e) {
  e.preventDefault(); // Prevent default anchor behavior
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
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
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]); // Extract JSON safely

    const templateImages = jsonData.table.rows;

    const imageGrid = document.querySelector(".image-grid");
    imageGrid.innerHTML = ""; // Clear any previous content

    // Loop through each row and get the image links from columns 1 and 2
    templateImages.forEach((row) => {
      const imageUrl = row.c[0]?.v; // Get the image URL from column 1
      const skinUrl = row.c[1]?.v; // Get the skin URL from column 2

      if (imageUrl && skinUrl) {
        // Create an img element and set the source
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Template Image";
        imgElement.dataset.skinUrl = skinUrl; // Store the skin URL in a data attribute

        // Add click event listener to update skinCanvas
        imgElement.addEventListener("click", function () {
          updateSkinCanvas(skinUrl);
        });

        imageGrid.appendChild(imgElement);
      }
    });
  } catch (error) {
    console.error("Error fetching template images:", error);
  }
}

// Function to update skinCanvas with the selected skin URL
function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
  skinImage.src = skinUrl;

  skinImage.onload = function () {
    // Set canvas size to match skin
    skinCanvas.width = skinImage.width;
    skinCanvas.height = skinImage.height;

    // Draw the new skin onto the canvas
    const ctx = skinCanvas.getContext("2d");
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height); // Clear the canvas
    ctx.drawImage(skinImage, 0, 0, skinCanvas.width, skinCanvas.height); // Draw the new skin

    // Update SkinViewer skin
    updateSkinViewer();
  };
}

// Ensure the parts selection menu is hidden initially
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").classList.add("hidden");
  document.getElementById("partList").classList.add("hidden");
});

// Function to handle template selection
function handleTemplateSelection() {
  // Close the popup (assuming the popup has an id of 'templatePopup')
  document.getElementById("templatePopup").style.display = "none";

  // Remove the hidden class from previewButton and downloadButton
  previewButton.classList.remove("hidden");
  downloadButton.classList.remove("hidden");

  // Add the hidden class to templateText and drop-zone
  document.getElementById("templateText").classList.add("hidden");
  document.getElementById("drop-zone").classList.add("hidden");
}

// Add event listener for template selection (assuming templates have a class of 'template')
document.querySelectorAll(".template").forEach((template) => {
  template.addEventListener("click", handleTemplateSelection);
});

// Ensure the DOM is fully loaded before handling file uploads
document.addEventListener("DOMContentLoaded", function () {
  // Your existing code for handling file uploads or other initializations
  fetchTemplateImages(); // Fetch and display template images
});

// Get the modal
var modal = document.getElementById("templateModal");

// Get the link that opens the modal
var link = document.getElementById("viewTemplatesLink");

// Get the <span> element that closes the modal
var closeBtn = document.getElementsByClassName("close-btn")[0];

// When the user clicks on the link, open the modal
link.onclick = function (e) {
  e.preventDefault(); // Prevent default anchor behavior
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Add event listener for template icons within the modal
document.querySelectorAll("#templateModal .template-icon").forEach((icon) => {
  icon.addEventListener("click", function () {
    updateSkinCanvas(icon.dataset.skinUrl); // Function to update the skincanvas
    modal.style.display = "none"; // Close the modal
  });
});

// Function to update the skincanvas
function updateSkinCanvas(skinUrl) {
  const skinImage = new Image();
  skinImage.crossOrigin = "anonymous"; // Set crossOrigin attribute
  skinImage.src = skinUrl;

  skinImage.onload = function () {
    // Set canvas size to match skin
    skinCanvas.width = skinImage.width;
    skinCanvas.height = skinImage.height;

    // Draw the new skin onto the canvas
    const ctx = skinCanvas.getContext("2d");
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height); // Clear the canvas
    ctx.drawImage(skinImage, 0, 0, skinCanvas.width, skinCanvas.height); // Draw the new skin

    // Update SkinViewer skin
    updateSkinViewer();
  };
}

// Fetch template images from Google Sheets
async function fetchTemplateImages() {
  try {
    const response = await fetch(
      "https://docs.google.com/spreadsheets/d/1sEQPiqXHtTt6RHwgAXYKnmMlBYn-v7oPUKHT3UK3c8I/gviz/tq?sheet=SkinTemplates&tqx=out:json"
    );
    const data = await response.text();
    const jsonData = JSON.parse(data.match(/.*?({.*}).*/)[1]); // Extract JSON safely

    const templateImages = jsonData.table.rows;

    const imageGrid = document.querySelector(".image-grid");
    imageGrid.innerHTML = ""; // Clear any previous content

    // Loop through each row and get the image links from columns 1 and 2
    templateImages.forEach((row) => {
      const imageUrl = row.c[0]?.v; // Get the image URL from column 1
      const skinUrl = row.c[1]?.v; // Get the skin URL from column 2

      if (imageUrl && skinUrl) {
        // Create an img element and set the source
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Template Image";
        imgElement.classList.add("template-icon");
        imgElement.dataset.skinUrl = skinUrl; // Store the skin URL in a data attribute

        // Add click event listener to update skinCanvas
        imgElement.addEventListener("click", function () {
          updateSkinCanvas(skinUrl);
          modal.style.display = "none"; // Close the modal

          // Hide elements with drop-zone and templateText classes
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

// Ensure the DOM is fully loaded before handling file uploads
document.addEventListener("DOMContentLoaded", function () {
  fetchTemplateImages(); // Fetch and display template images
});

// Get the modal
var modal = document.getElementById("templateModal");

// Get the link that opens the modal
var link = document.getElementById("viewTemplatesLink");

// Get the <span> element that closes the modal
var closeBtn = document.getElementsByClassName("close-btn")[0];

// When the user clicks on the link, open the modal
link.onclick = function (e) {
  e.preventDefault(); // Prevent default anchor behavior
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
