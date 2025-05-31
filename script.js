 // Global variables
 let currentRatio = "1:1";
 let currentStyle = "smart";
 let imageHistory = [];
 let originalImage = null;
 let pixelatedImage = null;
 let canvas = document.createElement('canvas');
 let ctx = canvas.getContext('2d');
 let sessionHistory = [];

 document.addEventListener("DOMContentLoaded", () => {
     const promptInput = document.getElementById("promptInput");
     const generateBtn = document.getElementById("generateBtn");
     const resultSection = document.getElementById("resultSection");
     const generatedImg = document.getElementById("generatedImg");
     const downloadBtn = document.getElementById("downloadBtn");
     const suggestionChips = document.querySelectorAll(".chip");
     const aspectRatioBtn = document.getElementById("aspect-ratio-btn");
     const ratioPopup = document.getElementById("ratio-popup");
     const overlay = document.getElementById("overlay");
     const closeRatioPopupBtn = document.getElementById("close-ratio-popup");
     const ratioOptions = document.querySelectorAll(".ratio-option");
     const currentRatioDisplay = document.querySelector(".current-ratio");
     const limitModal = document.getElementById("limitModal");
     const limitModalCloseBtn = document.getElementById("limitModalCloseBtn");
     const styleBtn = document.getElementById("style-btn");
     const stylePopup = document.getElementById("style-popup");
     const closeStylePopupBtn = document.getElementById("close-style-popup");
     const styleOptions = document.querySelectorAll(".style-option");
     const currentStyleDisplay = document.querySelector(".current-style");
     const historyContainer = document.getElementById("historyContainer");
     const emptyHistoryMessage = document.getElementById("emptyHistoryMessage");
     const clearHistoryBtn = document.getElementById("clearHistoryBtn");
     const imageUpload = document.getElementById("imageUpload");
     const pixelateBtn = document.getElementById("pixelateBtn");
     const pixelSize = document.getElementById("pixelSize");
     const colorPalette = document.getElementById("colorPalette");
     const dithering = document.getElementById("dithering");
     const originalImg = document.getElementById("originalImg");
     const pixelatedImg = document.getElementById("pixelatedImg");
     const valueDisplay = document.querySelector(".value-display");
     const historyFilterControls = document.getElementById('historyFilterControls');
     const historyPagination = document.getElementById('historyPagination');
     const styleFilter = document.getElementById("styleFilter");
     const sortOrder = document.getElementById("sortOrder");

     if (currentRatioDisplay) {
         currentRatioDisplay.textContent = currentRatio;
     }
     if (currentStyleDisplay) {
         currentStyleDisplay.textContent = "Smart";
     }
     initializeUserUsage();
     loadImageHistory();
     if (generateBtn) {
         generateBtn.addEventListener("click", () => handleImageGeneration(promptInput, resultSection, generatedImg));
     }

     if (promptInput) {
         promptInput.addEventListener("keypress", (e) => {
             if (e.key === "Enter") {
                 handleImageGeneration(promptInput, resultSection, generatedImg);
             }
         });
     }

     if (suggestionChips && suggestionChips.length > 0) {
         suggestionChips.forEach(chip => {
             chip.addEventListener("click", () => {
                 if (promptInput) {
                     promptInput.value = chip.textContent;
                     promptInput.focus();
                 }
             });
         });
     }
     if (aspectRatioBtn) {
         aspectRatioBtn.addEventListener("click", () => {
             if (ratioPopup && overlay) {
                 openPopup(ratioPopup, overlay);
             }
         });
     }
     if (closeRatioPopupBtn) {
         closeRatioPopupBtn.addEventListener("click", () => {
             if (ratioPopup && overlay) {
                 closePopup(ratioPopup, overlay);
             }
         });
     }
     if (overlay) {
         overlay.addEventListener("click", () => {
             if (ratioPopup && ratioPopup.classList.contains("show")) {
                 closePopup(ratioPopup, overlay);
             }
             if (stylePopup && stylePopup.classList.contains("show")) {
                 closePopup(stylePopup, overlay);
             }
         });
     }

     if (ratioOptions && ratioOptions.length > 0) {
         ratioOptions.forEach(option => {
             option.addEventListener("click", () => {
                 const ratio = option.getAttribute("data-ratio");
                 if (ratio) {
                     selectAspectRatio(ratio, currentRatioDisplay);
                     if (ratioPopup && overlay) {
                         closePopup(ratioPopup, overlay);
                     }
                 }
             });
         });
     }
     if (downloadBtn && generatedImg) {
         downloadBtn.addEventListener("click", () => downloadImage(generatedImg));
     }

     if (limitModalCloseBtn && limitModal && overlay) {
         limitModalCloseBtn.addEventListener("click", () => {
             limitModal.style.display = "none";
             overlay.classList.remove("show");
         });
     }
     if (styleBtn) {
         styleBtn.addEventListener("click", () => {
             if (stylePopup && overlay) {
                 openPopup(stylePopup, overlay);
             }
         });
     }
     if (closeStylePopupBtn) {
         closeStylePopupBtn.addEventListener("click", () => {
             if (stylePopup && overlay) {
                 closePopup(stylePopup, overlay);
             }
         });
     }
     if (styleOptions && styleOptions.length > 0) {
         styleOptions.forEach(option => {
             option.addEventListener("click", () => {
                 const style = option.getAttribute("data-style");
                 if (style) {
                     selectStyle(style, currentStyleDisplay);
                     if (stylePopup && overlay) {
                         closePopup(stylePopup, overlay);
                     }
                 }
             });
         });
     }
     if (clearHistoryBtn) {
         clearHistoryBtn.addEventListener("click", () => {
             clearImageHistory();
         });
     }
     updateSelectedRatio();
     updateSelectedStyle();
     updateImageContainerRatio(currentRatio);

     // Update pixel size display
     if (pixelSize) {
         if (valueDisplay) {
             // Set initial value
             valueDisplay.textContent = `${pixelSize.value}px`;

             // Update on input change
             pixelSize.addEventListener('input', () => {
                 valueDisplay.textContent = `${pixelSize.value}px`;
             });
         }
     }

     // Handle image upload
     if (imageUpload) {
         imageUpload.addEventListener("change", (e) => {
             const file = e.target.files[0];
             if (file) {
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     originalImage = new Image();
                     originalImage.onload = () => {
                         originalImg.src = e.target.result;
                         originalImg.setAttribute("data-src", e.target.result);
                         originalImg.setAttribute("data-orig-src", e.target.result);
                         originalImg.style.display = 'block';
                         resultSection.classList.remove("error");
                         resultSection.classList.add("success");

                         // Show pixelation controls and actions
                         document.querySelector('.pixelation-controls').classList.add('visible');

                         // Make sure actions container is visible
                         const actionsContainer = document.querySelector('.actions');
                         actionsContainer.classList.add('visible');
                         actionsContainer.classList.add('has-image');
                         actionsContainer.style.opacity = '1';

                         // Ensure regenerate button is visible
                         const regenerateBtn = document.getElementById('regenerateBtn');
                         if (regenerateBtn) {
                             regenerateBtn.classList.add('visible');
                             regenerateBtn.style.display = 'flex';
                         }

                         // Hide the file upload container
                         document.querySelector('.file-upload-container').style.display = 'none';
                     };
                     originalImage.src = e.target.result;
                     originalImage.setAttribute("data-src", e.target.result);
                     originalImage.setAttribute("data-orig-src", e.target.result);
                 };
                 reader.readAsDataURL(file);
             }
         });
     }

     // Handle pixelation
     if (pixelateBtn) {
         pixelateBtn.addEventListener("click", () => {
             if (!originalImage) {
                 showError("Please upload an image first");
                 return;
             }

             resultSection.classList.add("loading");
             resultSection.classList.remove("error", "success");

             setTimeout(() => {
                 try {
                     const pixelSizeValue = parseInt(pixelSize.value);

                     pixelatedImage = pixelateImage(
                         originalImage,
                         pixelSizeValue
                     );

                     pixelatedImg.src = pixelatedImage;
                     pixelatedImg.setAttribute("data-src", pixelatedImage);
                     pixelatedImg.setAttribute("data-orig-src", pixelatedImage);
                     resultSection.classList.remove("loading");
                     resultSection.classList.add("success");
                 } catch (error) {
                     showError("Error creating pixel art. Please try again.");
                     console.error(error);
                 }
             }, 500);
         });
     }

     // Handle regenerate functionality
     const regenerateBtn = document.getElementById("regenerateBtn");
     if (regenerateBtn) {
         regenerateBtn.addEventListener("click", () => {
             // Reset the form and visual elements
             resetToolToInitialState();
         });
     }

     // Handle download
     if (downloadBtn) {
         downloadBtn.addEventListener("click", () => {
             if (!pixelatedImage) {
                 showError("No pixel art to download");
                 return;
             }

             const link = document.createElement("a");
             link.download = "pixel-art.png";
             link.href = pixelatedImage;
             link.click();
         });
     }

     if (styleFilter) styleFilter.addEventListener("change", applyFilters);
     if (sortOrder) sortOrder.addEventListener("change", applyFilters);
     applyFilters(); // Ensure filters are applied on load
 });

 function openPopup(popup, overlay) {
     if (!popup || !overlay) {
         console.error("Missing required elements for popup", popup, overlay);
         return;
     }
     popup.style.display = "block";
     overlay.style.display = "block";

     void popup.offsetWidth;
     void overlay.offsetWidth;

     setTimeout(() => {
         popup.classList.add("show");
         overlay.classList.add("show");
     }, 10);

     console.log("Popup opened:", popup.id);
 }

 function closePopup(popup, overlay) {
     if (!popup || !overlay) {
         console.error("Missing required elements for popup");
         return;
     }
     popup.classList.remove("show");
     setTimeout(() => {
         popup.style.display = "none";
         const visiblePopups = document.querySelectorAll(".aspect-ratio-selector.show, .style-selector.show, .limit-modal");
         const anyVisible = Array.from(visiblePopups).some(el =>
             el.classList.contains("show") ||
             (el.classList.contains("limit-modal") && el.style.display === "block")
         );

         if (!anyVisible) {
             overlay.classList.remove("show");
             setTimeout(() => {
                 overlay.style.display = "none";
             }, 300);
         }
     }, 300);
 }

 function loadImageHistory() {
     try {
         const savedHistory = sessionStorage.getItem('pixelationHistory');
         if (savedHistory) {
             sessionHistory = JSON.parse(savedHistory);
             updateHistoryDisplay();
         }
     } catch (error) {
         console.error("Error loading image history:", error);
         sessionHistory = [];
     }
 }

 function saveImageToHistory(imageUrl, prompt) {
     if (!imageUrl || !prompt) {
         console.error("Cannot save to history: missing URL or prompt");
         return;
     }

     const historyItem = {
         id: Date.now(),
         url: imageUrl,
         prompt: prompt,
         timestamp: new Date().toISOString(),
         style: currentStyle,
         ratio: currentRatio
     };

     imageHistory.unshift(historyItem);

     if (imageHistory.length > 20) {
         imageHistory = imageHistory.slice(0, 20);
     }

     try {
         localStorage.setItem("imageHistory", JSON.stringify(imageHistory));
     } catch (error) {
         console.error("Error saving to localStorage:", error);
     }

     updateHistoryDisplay();
 }

 function updateHistoryDisplay() {
     const historyContainer = document.getElementById('historyContainer');
     const emptyHistoryMessage = document.getElementById('emptyHistoryMessage');
     const historyFilterControls = document.getElementById('historyFilterControls');
     const historyPagination = document.getElementById('historyPagination');
     const clearHistoryBtn = document.getElementById('clearHistoryBtn');

     if (!historyContainer) return;

     try {
         // Get history from session storage or use the session history array
         const history = sessionHistory.length > 0 ? sessionHistory :
             JSON.parse(sessionStorage.getItem('pixelationHistory') || '[]');

         // Clear current history display
         historyContainer.innerHTML = '';

         if (history.length === 0) {
             // Show empty history message
             historyContainer.innerHTML = `
             <div class="empty-history-message" id="emptyHistoryMessage">
                 <div class="empty-icon-container">
                     <i class="fas fa-image"></i>
                 </div>
                 <p>Your generated images will appear here</p>
                 <p class="empty-history-subtitle">Create your first masterpiece!</p>
             </div>
         `;

             // Hide controls
             if (historyFilterControls) historyFilterControls.style.display = 'none';
             if (historyPagination) historyPagination.style.display = 'none';
             if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
             return;
         }

         // Show controls since we have history
         if (historyFilterControls) historyFilterControls.style.display = 'flex';
         if (historyPagination) historyPagination.style.display = 'flex';
         if (clearHistoryBtn) clearHistoryBtn.style.display = 'block';

         // Create history items
         history.forEach((item, index) => {
             const historyItem = document.createElement('div');
             historyItem.className = 'history-item';

             historyItem.innerHTML = `
             <div class="history-image-container">
                 <div class="history-image-wrapper">
                     <img src="${item.pixelatedImage}" alt="Pixelated image ${index + 1}" class="history-preview-image"
                         data-src="${item.pixelatedImage}"
                         data-orig-src="${item.pixelatedImage}">
                     <div class="history-actions">
                         <button class="btn btn-icon history-favorite" data-id="${item.id}" title="Add to favorites">
                             <i class="far fa-star"></i>
                         </button>
                         <button class="btn btn-icon history-download" data-url="${item.pixelatedImage}" title="Download">
                             <i class="fas fa-download"></i>
                         </button>
                         <button class="btn btn-icon history-delete" data-id="${item.id}" title="Remove">
                             <i class="fas fa-trash"></i>
                         </button>
             </div>
                 </div>
                     </div>
             <div class="history-info">
                 <p class="history-prompt" title="${item.prompt}">${item.prompt}</p>
                 <div class="history-meta">
                     <span class="history-date" title="${new Date(item.timestamp).toLocaleString()}">
                         <i class="far fa-clock"></i> ${formatDate(item.timestamp)}
                     </span>
                     <span class="history-style">
                         <i class="fas fa-paint-brush"></i> ${item.style || 'Smart'}
                     </span>
                     <span class="history-ratio">
                         <i class="fas fa-crop-alt"></i> ${item.ratio || '1:1'}
                     </span>
                 </div>
             </div>
         `;

             // Add event listeners for the new action buttons
             const downloadBtn = historyItem.querySelector('.history-download');
             if (downloadBtn) {
                 downloadBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     downloadHistoryImage(item.pixelatedImage);
                 });
             }
             const deleteBtn = historyItem.querySelector('.history-delete');
             if (deleteBtn) {
                 deleteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     removeHistoryItem(item.id);
                 });
             }
             const favoriteBtn = historyItem.querySelector('.history-favorite');
             if (favoriteBtn) {
                 favoriteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     toggleFavorite(item.id);
                 });
             }

             historyContainer.appendChild(historyItem);
         });
     } catch (error) {
         console.error('Error updating history display:', error);
     }
 }

 // Helper function to format date
 function formatDate(timestamp) {
     try {
         const date = new Date(timestamp);
         return date.toLocaleString('en-US', {
             month: 'short',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
         });
     } catch (error) {
         console.error('Error formatting date:', error);
         return 'Unknown date';
     }
 }

 function applyFilters() {
     const styleFilter = document.getElementById("styleFilter").value;
     const sortOrder = document.getElementById("sortOrder").value;

     // Use sessionHistory or load from sessionStorage
     let filteredHistory = sessionHistory.length > 0 ? [...sessionHistory] : JSON.parse(sessionStorage.getItem('pixelationHistory') || '[]');

     // Filter by style
     if (styleFilter !== "all") {
         filteredHistory = filteredHistory.filter(item => (item.style || 'Smart') === styleFilter);
     }

     // Sort
     filteredHistory.sort((a, b) => {
         const dateA = new Date(a.timestamp);
         const dateB = new Date(b.timestamp);
         if (sortOrder === "newest") {
             return dateB - dateA;
         } else {
             return dateA - dateB;
         }
     });

     renderFilteredHistory(filteredHistory);
 }

 function renderFilteredHistory(filteredItems) {
     const historyContainer = document.getElementById("historyContainer");
     historyContainer.innerHTML = '';

     if (filteredItems.length === 0) {
         const noResultsMessage = document.createElement("div");
         noResultsMessage.className = "empty-history-message";
         noResultsMessage.innerHTML = `
         <i class="fas fa-search"></i>
         <p>No matching images found</p>
         <p class="empty-history-subtitle">Try changing your filters</p>
     `;
         historyContainer.appendChild(noResultsMessage);
     } else {
         filteredItems.forEach((item, index) => {
             const historyItem = document.createElement("div");
             historyItem.className = "history-item";
             historyItem.innerHTML = `
             <div class="history-image-container">
                 <div class="history-image-wrapper">
                     <img src="${item.pixelatedImage || item.url}" alt="${item.prompt}" class="history-preview-image"
                         data-src="${item.pixelatedImage || item.url}"
                         data-orig-src="${item.pixelatedImage || item.url}">
                     <div class="history-actions">
                         <button class="btn btn-icon history-favorite" data-id="${item.id}" title="Add to favorites">
                             <i class="far fa-star"></i>
                         </button>
                         <button class="btn btn-icon history-download" data-url="${item.pixelatedImage || item.url}" title="Download">
                             <i class="fas fa-download"></i>
                         </button>
                         <button class="btn btn-icon history-delete" data-id="${item.id}" title="Remove">
                             <i class="fas fa-trash"></i>
                         </button>
                     </div>
                 </div>
             </div>
             <div class="history-info">
                 <p class="history-prompt" title="${item.prompt}">${item.prompt}</p>
                 <div class="history-meta">
                     <span class="history-date" title="${new Date(item.timestamp).toLocaleString()}">
                         <i class="far fa-clock"></i> ${formatDate(item.timestamp)}
                     </span>
                     <span class="history-style">
                         <i class="fas fa-paint-brush"></i> ${item.style || 'Smart'}
                     </span>
                     <span class="history-ratio">
                         <i class="fas fa-crop-alt"></i> ${item.ratio || '1:1'}
                     </span>
                 </div>
             </div>
         `;
             // Add event listeners for the new action buttons
             const downloadBtn = historyItem.querySelector('.history-download');
             if (downloadBtn) {
                 downloadBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     downloadHistoryImage(item.pixelatedImage || item.url);
                 });
             }
             const deleteBtn = historyItem.querySelector('.history-delete');
             if (deleteBtn) {
                 deleteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     removeHistoryItem(item.id);
                 });
             }
             const favoriteBtn = historyItem.querySelector('.history-favorite');
             if (favoriteBtn) {
                 favoriteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     toggleFavorite(item.id);
                 });
             }
             historyContainer.appendChild(historyItem);
         });
     }
 }

 function getUniqueStyles() {
     return [...new Set(imageHistory.map(item => item.style))];
 }

 function toggleFavorite(id) {
     const index = imageHistory.findIndex(item => item.id === id);
     if (index !== -1) {
         imageHistory[index].favorite = !imageHistory[index].favorite;
         saveImageHistory();
         updateHistoryDisplay();
     }
 }

 function showImagePreview(item) {
     // Create modal for image preview
     const modal = document.createElement("div");
     modal.className = "image-preview-modal";
     modal.innerHTML = `
     <div class="modal-content1">
         <div class="modal-header1">
             <h3>${truncateText(item.prompt, 100)}</h3>
             <button class="modal-close"><i class="fas fa-times"></i></button>
         </div>
         <div class="modal-body1">
             <img src="${item.url}" data-src="${item.url}" data-orig-src="${item.url}" alt="${item.prompt}">
         </div>
         <div class="modal-footer1">
             <div class="image-details">
                 <p><strong>Style:</strong> ${formatStyle(item.style)}</p>
                 <p><strong>Ratio:</strong> ${item.ratio}</p>
                 <p><strong>Created:</strong> ${new Date(item.timestamp).toLocaleString()}</p>
             </div>
             <div class="modal-actions">
                 <button class="btn btn-primary use-image-btn">
                     <i class="fas fa-magic"></i> Use This Image
                 </button>
                 <button class="btn btn-outline download-btn">
                     <i class="fas fa-download"></i> Download
                 </button>
             </div>
         </div>
     </div>
 `;

     document.body.appendChild(modal);

     // Prevent scrolling on body when modal is open
     document.body.classList.add("modal-open");

     // Add event listeners
     const closeBtn = modal.querySelector(".modal-close");
     const useBtn = modal.querySelector(".use-image-btn");
     const downloadBtn = modal.querySelector(".download-btn");

     closeBtn.addEventListener("click", () => {
         document.body.removeChild(modal);
         document.body.classList.remove("modal-open");
     });

     modal.addEventListener("click", (e) => {
         if (e.target === modal) {
             document.body.removeChild(modal);
             document.body.classList.remove("modal-open");
         }
     });

     useBtn.addEventListener("click", () => {
         restoreImage(item);
         document.body.removeChild(modal);
         document.body.classList.remove("modal-open");

         // Explicitly scroll to the prompt section
         const promptSection = document.querySelector("#promptInput").closest(".card");
         if (promptSection) {
             promptSection.scrollIntoView({ behavior: 'smooth' });
         }
     });

     downloadBtn.addEventListener("click", () => {
         downloadHistoryImage(item.url);
     });
 }

 // Function to restore image to the prompt section
 function restoreImage(item) {
     // Set the prompt field value
     const promptField = document.getElementById("promptInput");
     if (promptField) {
         promptField.value = item.prompt;

         // Focus on the prompt input
         promptField.focus();

         // Scroll to the prompt section
         const promptSection = document.getElementById("promptInput").closest(".card");
         if (promptSection) {
             promptSection.scrollIntoView({ behavior: 'smooth' });
         }
     }

     // Set other values as needed (style, ratio, etc.)
     const styleSelector = document.querySelector(".current-style");
     if (styleSelector) {
         styleSelector.textContent = formatStyle(item.style);
     }

     const ratioSelector = document.querySelector(".current-ratio");
     if (ratioSelector) {
         ratioSelector.textContent = item.ratio;
     }

     // Highlight the prompt section to draw attention to it
     if (promptField) {
         const card = promptField.closest(".card");
         if (card) {
             // Add a highlight class
             card.classList.add("highlight-card");

             // Remove the highlight class after animation completes
             setTimeout(() => {
                 card.classList.remove("highlight-card");
             }, 1500);
         }
     }
 }

 function truncateText(text, maxLength) {
     if (!text) return "";
     if (text.length <= maxLength) return text;
     return text.substring(0, maxLength) + "...";
 }

 function formatStyle(style) {
     if (!style) return "";
     return style
         .split('-')
         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
         .join(' ');
 }

 function downloadHistoryImage(url) {
     if (!url) {
         console.error("No URL provided for download");
         return;
     }

     try {
         fetch(url)
             .then(response => response.blob())
             .then(blob => {
                 const blobUrl = URL.createObjectURL(blob);
                 const downloadLink = document.createElement("a");
                 downloadLink.href = blobUrl;
                 downloadLink.download = `ai-generated-image-${Date.now()}.jpg`;
                 document.body.appendChild(downloadLink);

                 downloadLink.click();

                 document.body.removeChild(downloadLink);
                 URL.revokeObjectURL(blobUrl);
             })
             .catch(error => {
                 console.error("Error fetching image for download:", error);
                 alert("Failed to download the image. Please try again.");
             });
     } catch (error) {
         console.error("Error downloading image:", error);
         alert("Failed to download the image. Please try again.");
     }
 }

 function removeHistoryItem(id) {
     if (!id) {
         console.error("No ID provided for removal");
         return;
     }

     // Remove from sessionHistory array
     sessionHistory = sessionHistory.filter(item => item.id !== id);

     // Update session storage
     try {
         sessionStorage.setItem('pixelationHistory', JSON.stringify(sessionHistory));

         // Update the history display to reflect the change
         updateHistoryDisplay();
     } catch (error) {
         console.error("Error updating session storage:", error);
     }
 }

 function clearImageHistory() {
     if (confirm("Are you sure you want to clear your image history?")) {
         // Clear the history array
         sessionHistory = [];

         // Clear session storage
         try {
             sessionStorage.removeItem('pixelationHistory');
         } catch (error) {
             console.error("Error removing from sessionStorage:", error);
         }

         // Reset the history container to its initial state
         const historyContainer = document.getElementById('historyContainer');
         if (historyContainer) {
             historyContainer.innerHTML = `
             <div class="empty-history-message" id="emptyHistoryMessage">
                 <div class="empty-icon-container">
                     <i class="fas fa-image"></i>
                 </div>
                 <p>Your generated images will appear here</p>
                 <p class="empty-history-subtitle">Create your first masterpiece!</p>
             </div>
         `;
         }

         // Hide all controls
         const historyFilterControls = document.getElementById('historyFilterControls');
         const historyPagination = document.getElementById('historyPagination');
         const clearHistoryBtn = document.getElementById('clearHistoryBtn');

         if (historyFilterControls) historyFilterControls.style.display = 'none';
         if (historyPagination) historyPagination.style.display = 'none';
         if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
     }
 }

 function initializeUserUsage() {
     const today = new Date().toDateString();
     const storedDate = localStorage.getItem("current_date");

     if (storedDate !== today) {
         try {
             localStorage.setItem("current_date", today);
             localStorage.setItem("num_used", "0");
         } catch (error) {
             console.error("Error initializing user usage:", error);
         }
     }
 }

 function getUserUsageCount() {
     try {
         return parseInt(localStorage.getItem("num_used") || "0");
     } catch (error) {
         console.error("Error getting user usage:", error);
         return 0;
     }
 }

 function incrementUserUsage() {
     try {
         const currentUsage = getUserUsageCount();
         localStorage.setItem("num_used", (currentUsage + 1).toString());
     } catch (error) {
         console.error("Error incrementing user usage:", error);
     }
 }

 function checkUserLimit() {
     const currentUsage = getUserUsageCount();
     return false;
 }

 function openRatioSelector(ratioPopup, overlay) {
     if (!ratioPopup || !overlay) {
         console.error("Missing required elements for ratio selector");
         return;
     }

     ratioPopup.style.display = "block";
     overlay.style.display = "block";
     void ratioPopup.offsetWidth;

     ratioPopup.classList.add("show");
     overlay.classList.add("show");
 }

 function closeRatioSelector(ratioPopup, overlay) {
     if (!ratioPopup || !overlay) {
         console.error("Missing required elements for ratio selector");
         return;
     }

     ratioPopup.classList.remove("show");
     overlay.classList.remove("show");

     setTimeout(() => {
         ratioPopup.style.display = "none";
         const stylePopup = document.getElementById("style-popup");
         const limitModal = document.getElementById("limitModal");

         if ((!stylePopup || !stylePopup.classList.contains("show")) &&
             (!limitModal || limitModal.style.display !== "block")) {
             overlay.style.display = "none";
         }
     }, 300);
 }

 function openStyleSelector(stylePopup, overlay) {
     if (!stylePopup || !overlay) {
         console.error("Missing required elements for style selector");
         return;
     }

     stylePopup.style.display = "block";
     overlay.style.display = "block";
     void stylePopup.offsetWidth;

     stylePopup.classList.add("show");
     overlay.classList.add("show");
 }

 function closeStyleSelector(stylePopup, overlay) {
     if (!stylePopup || !overlay) {
         console.error("Missing required elements for style selector");
         return;
     }

     stylePopup.classList.remove("show");
     overlay.classList.remove("show");

     setTimeout(() => {
         stylePopup.style.display = "none";
         const ratioPopup = document.getElementById("ratio-popup");
         const limitModal = document.getElementById("limitModal");

         if ((!ratioPopup || !ratioPopup.classList.contains("show")) &&
             (!limitModal || limitModal.style.display !== "block")) {
             overlay.style.display = "none";
         }
     }, 300);
 }

 function updateImageContainerRatio(ratio) {
     const container = document.querySelector('.generated-image');
     if (!container) return;
     container.className = 'generated-image';
     switch (ratio) {
         case "16:9":
             container.classList.add('ratio-16-9');
             break;
         case "9:16":
             container.classList.add('ratio-9-16');
             break;
         case "4:3":
             container.classList.add('ratio-4-3');
             break;
         case "3:4":
             container.classList.add('ratio-3-4');
             break;
         case "2:1":
             container.classList.add('ratio-2-1');
             break;
         default: // 1:1
             container.classList.add('ratio-1-1');
     }
 }

 function updateSelectedRatio() {
     // Remove selected class from all options
     const ratioOptions = document.querySelectorAll(".ratio-option");
     if (ratioOptions) {
         ratioOptions.forEach(option => {
             option.classList.remove("selected");
         });
     }

     // Add selected class to current ratio
     const selectedOption = document.querySelector(`.ratio-option[data-ratio="${currentRatio}"]`);
     if (selectedOption) {
         selectedOption.classList.add("selected");
     }
 }

 function selectAspectRatio(ratio, currentRatioDisplay) {
     if (!ratio) {
         console.error("No ratio provided");
         return;
     }

     currentRatio = ratio;

     if (currentRatioDisplay) {
         currentRatioDisplay.textContent = ratio;
     }

     updateSelectedRatio();
     // Make sure we update the image container when ratio changes
     updateImageContainerRatio(ratio);

     // Update the result section container if visible
     const resultSection = document.getElementById("resultSection");
     if (resultSection && resultSection.style.display === "block") {
         updateResultSectionRatio(ratio);
     }
 }

 function updateResultSectionRatio(ratio) {
     const container = document.querySelector('.generated-image');
     if (!container) return;

     container.classList.remove('ratio-1-1', 'ratio-16-9', 'ratio-9-16', 'ratio-4-3', 'ratio-3-4', 'ratio-2-1');

     switch (ratio) {
         case "16:9":
             container.classList.add('ratio-16-9');
             break;
         case "9:16":
             container.classList.add('ratio-9-16');
             break;
         case "4:3":
             container.classList.add('ratio-4-3');
             break;
         case "3:4":
             container.classList.add('ratio-3-4');
             break;
         case "2:1":
             container.classList.add('ratio-2-1');
             break;
         default: // 1:1
             container.classList.add('ratio-1-1');
     }
 }

 function selectStyle(style, currentStyleDisplay) {
     if (!style) {
         console.error("No style provided");
         return;
     }

     currentStyle = style;

     if (currentStyleDisplay) {
         currentStyleDisplay.textContent = formatStyle(style);
     }

     updateSelectedStyle();
 }

 function updateSelectedStyle() {
     const styleOptions = document.querySelectorAll(".style-option");
     if (styleOptions) {
         styleOptions.forEach(option => {
             option.classList.remove("selected");
         });
     }
     const selectedOption = document.querySelector(`.style-option[data-style="${currentStyle}"]`);
     if (selectedOption) {
         selectedOption.classList.add("selected");
     }
 }

 async function generateImage(prompt, aspectRatio) {
     if (!prompt || !aspectRatio) {
         console.error("Missing required parameters for image generation");
         return null;
     }

     const apiUrl = `https://hvzaqo2ub8.execute-api.us-east-1.amazonaws.com/default/image_ai`;
     const apiStyleFormat = currentStyle.replace(/-/g, '_');
     const params = new URLSearchParams({
         link: 'writecream_2',
         prompt: prompt,
         aspect_ratio: aspectRatio,
         style: apiStyleFormat
     });

     const fullUrl = `${apiUrl}?${params.toString()}`;
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

     try {
         const response = await fetch(fullUrl, {
             method: 'GET',
             mode: 'cors', // Try with CORS enabled
             cache: 'no-cache',
             signal: controller.signal
         });

         clearTimeout(timeoutId);

         if (!response.ok) {
             throw new Error(`API responded with status ${response.status}`);
         }

         const data = await response.json();

         if (data && data.status === "success" && data.image_link) {
             return data.image_link;
         } else {
             throw new Error("No valid image link received from API");
         }
     } catch (error) {
         console.error("Error calling API:", error);

         if (error.message.includes("CORS") || error.name === "TypeError") {
             console.log("Attempting fallback method...");
             return tryFallbackMethod(prompt, aspectRatio, apiStyleFormat);
         }

         throw error;
     }
 }

 async function tryFallbackMethod(prompt, aspectRatio, styleFormat) {
     console.log("Using fallback image generation method");

     return getFallbackImageUrl();
 }

 function getFallbackImageUrl() {
     return "https://via.placeholder.com/512x512.png?text=Generated+Image";
 }

 async function handleImageGeneration(promptInput, resultSection, generatedImg) {
     if (!promptInput || !resultSection || !generatedImg) {
         console.error("Missing required elements for image generation");
         return;
     }

     const prompt = promptInput.value.trim();

     if (!prompt) {
         alert("Please enter a prompt before generating an image");
         promptInput.focus();
         return;
     }

     // Check user limit
     if (checkUserLimit()) {
         showLimitModal();
         return;
     }

     // Show loading state
     resultSection.style.display = "block";
     resultSection.className = "result-section loading";

     try {
         // Add style information to the prompt to reinforce the style choice
         let enhancedPrompt = prompt;

         if (currentStyle !== "smart" && currentStyle !== "none") {
             // Create a user-friendly style name
             const styleName = currentStyle
                 .split('-')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');

             // Add style instruction to the prompt
             enhancedPrompt = `${prompt}, in ${styleName} style`;
         }

         console.log("Starting image generation with prompt:", enhancedPrompt);

         // Generate the image with proper error handling
         let imageUrl;
         try {
             // Use the new generateImage function
             imageUrl = await generateImage(enhancedPrompt, currentRatio);
             console.log("Received image URL:", imageUrl);
         } catch (apiError) {
             console.error("API Error:", apiError);
             // For debugging, use a fallback image
             imageUrl = getFallbackImageUrl();
             console.log("Using fallback image:", imageUrl);
         }

         if (imageUrl) {
             // Increment user usage
             incrementUserUsage();

             // Show the image
             generatedImg.onload = () => {
                 resultSection.className = "result-section success";
                 console.log("Image loaded successfully");
             };

             generatedImg.onerror = (e) => {
                 console.error("Failed to load image:", e);
                 resultSection.className = "result-section error";
                 const errorMessageElement = document.querySelector('.error-message p');
                 if (errorMessageElement) {
                     errorMessageElement.textContent = "Failed to load the generated image. Please try again.";
                 }
             };

             // Set the source after defining handlers
             generatedImg.src = imageUrl;
             generatedImg.setAttribute('data-src', item.url);
             generatedImg.setAttribute('data-orig-src', item.url);

             // Save to history
             saveImageToHistory(imageUrl, prompt);
         } else {
             throw new Error("No image URL returned");
         }
     } catch (error) {
         console.error("Error generating image:", error);

         resultSection.className = "result-section error";

         // Update error message with more specific information
         const errorMessageElement = document.querySelector('.error-message p');
         if (errorMessageElement) {
             if (error.message.includes("timed out")) {
                 errorMessageElement.textContent = "The request timed out. Please try again with a different prompt.";
             } else if (error.message.includes("Network error")) {
                 errorMessageElement.textContent = "Network error. Please check your internet connection.";
             } else if (error.message.includes("API Error")) {
                 errorMessageElement.textContent = error.message;
             } else {
                 errorMessageElement.textContent = "Something went wrong. Please try again.";
             }
         }
     }
 }

 async function downloadImage() {
     try {
         const pixelatedImg = document.getElementById('pixelatedImg');
         if (!pixelatedImg || !pixelatedImg.src) {
             showError('No image available to download');
             return;
         }

         // First fetch the image data
         const response = await fetch(pixelatedImg.src);
         if (!response.ok) {
             throw new Error('Failed to fetch image data');
         }

         // Get the image blob
         const blob = await response.blob();

         // Create a new blob with explicit MIME type
         const imageBlob = new Blob([blob], { type: 'image/png' });

         // Create a temporary URL for the blob
         const blobUrl = window.URL.createObjectURL(imageBlob);

         // Create and trigger download
         const link = document.createElement('a');
         link.style.display = 'none';
         link.href = blobUrl;
         link.download = 'pixel-art.png';

         document.body.appendChild(link);
         link.click();

         // Clean up
         setTimeout(() => {
             document.body.removeChild(link);
             window.URL.revokeObjectURL(blobUrl);
         }, 1000); // Give more time for the download to complete

     } catch (error) {
         console.error('Error downloading image:', error);

         // Fallback method if fetch fails
         try {
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');

             canvas.width = pixelatedImg.naturalWidth;
             canvas.height = pixelatedImg.naturalHeight;

             ctx.drawImage(pixelatedImg, 0, 0);

             // Try to force download using 'image/octet-stream'
             const link = document.createElement('a');
             link.download = 'pixel-art.png';
             link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
             link.click();
         } catch (fallbackError) {
             console.error('Fallback download failed:', fallbackError);
             showError('Failed to download image. Please try again.');
         }
     }
 }

 function showLimitModal() {
     const limitModal = document.getElementById("limitModal");
     const overlay = document.getElementById("overlay");

     if (!limitModal || !overlay) {
         console.error("Missing required elements for limit modal");
         return;
     }

     limitModal.style.display = "block";
     overlay.style.display = "block";

     void overlay.offsetWidth;

     overlay.classList.add("show");
 }

 document.addEventListener('DOMContentLoaded', function () {
     const faqItems = document.querySelectorAll('.faq-item');

     faqItems.forEach(item => {
         const question = item.querySelector('.faq-question');
         const answer = item.querySelector('.faq-answer');
         const toggleBtn = item.querySelector('.faq-icon');

         if (question && answer && toggleBtn) {
             question.addEventListener('click', function () {
                 const isOpen = answer.style.display === 'block';

                 // Close all answers
                 document.querySelectorAll('.faq-answer').forEach(a => {
                     a.style.display = 'none';
                 });

                 document.querySelectorAll('.faq-icon').forEach(btn => {
                     btn.textContent = '+';
                 });

                 // Toggle current answer
                 if (!isOpen) {
                     answer.style.display = 'block';
                     toggleBtn.textContent = '-';
                 }
             });
         }
     });
 });

 // Carousel functionality
 document.addEventListener('DOMContentLoaded', function () {
     const toolsGrid = document.querySelector('.other-tools-grid');
     const tools = document.querySelectorAll('.other-tools-link');

     // Clone the tools to create seamless loop
     tools.forEach(tool => {
         const clone = tool.cloneNode(true);
         toolsGrid.appendChild(clone);
     });
 });

 // Scroll animation handler
 document.addEventListener('DOMContentLoaded', () => {
     // Get all elements with animation classes
     const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');

     // Create Intersection Observer
     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.classList.add('active');
                 // Unobserve after animation to prevent re-triggering
                 observer.unobserve(entry.target);
             }
         });
     }, {
         threshold: 0.1, // Trigger when 10% of the element is visible
         rootMargin: '0px 0px -50px 0px' // Adjust trigger point slightly above the viewport
     });

     // Observe all animated elements
     animatedElements.forEach(element => {
         observer.observe(element);
     });
 });

 /**
  * Advanced Scroll Animation Controller
  * Features:
  * - Smooth scroll-triggered animations
  * - Staggered animations for groups
  * - Responsive animation adjustments
  * - Performance optimized with IntersectionObserver
  * - Dynamic animation sequencing
  * - Mobile-friendly touch support
  */

 class AnimationController {
     constructor(config) {
         this.config = {
             // Default configuration
             observerOptions: {
                 root: null,
                 rootMargin: '0px 0px -100px 0px',
                 threshold: 0.15
             },
             animationDefaults: {
                 duration: 0.6,
                 easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                 fillMode: 'forwards'
             },
             // Merge with user config
             ...config
         };

         this.animatedElements = new Set();
         this.observers = new Map();
         this.resizeObserver = null;
         this.lastScrollPosition = 0;
         this.scrollDirection = 'down';
         this.isMobile = window.innerWidth < 768;
         this.init();
     }

     init() {
         this.setupEventListeners();
         this.createObservers();
         this.setupResizeObserver();
         this.prepareElements();
         // Call checkVisibleElements after initialization to animate elements already in viewport
         this.checkVisibleElements();
     }

     setupEventListeners() {
         // Throttled scroll handler for direction detection
         let lastScrollTop = 0;
         this.scrollHandler = () => {
             const st = window.pageYOffset || document.documentElement.scrollTop;
             this.scrollDirection = st > lastScrollTop ? 'down' : 'up';
             lastScrollTop = st <= 0 ? 0 : st;
         };

         // Properly attach the scroll handler
         window.addEventListener('scroll', this.scrollHandler, { passive: true });
         window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
         window.addEventListener('orientationchange', this.handleResize.bind(this), { passive: true });
         document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
     }

     handleResize() {
         this.isMobile = window.innerWidth < 768;
         // Adjust animation thresholds for mobile
         this.config.observerOptions.threshold = this.isMobile ? 0.05 : 0.15;

         // Reinitialize observers with new settings
         this.observers.forEach(observer => observer.disconnect());
         this.createObservers();
         this.checkVisibleElements(); // Check for visible elements after resize
     }

     handleVisibilityChange() {
         if (document.visibilityState === 'visible') {
             // Recheck visible elements when returning to tab
             this.checkVisibleElements();
         }
     }

     setupResizeObserver() {
         if (typeof ResizeObserver === 'undefined') {
             console.warn('ResizeObserver not supported in this browser');
             return;
         }

         this.resizeObserver = new ResizeObserver(entries => {
             entries.forEach(entry => {
                 const element = entry.target;
                 if (this.animatedElements.has(element)) {
                     // Reset animation if element size changes significantly
                     const previousWidth = element.dataset.prevWidth;
                     const previousHeight = element.dataset.prevHeight;
                     const currentWidth = entry.contentRect.width;
                     const currentHeight = entry.contentRect.height;

                     // Only reset if size changed significantly (>10%)
                     if (previousWidth && previousHeight) {
                         const widthChange = Math.abs(currentWidth - previousWidth) / previousWidth;
                         const heightChange = Math.abs(currentHeight - previousHeight) / previousHeight;

                         if (widthChange > 0.1 || heightChange > 0.1) {
                             this.resetElementAnimation(element);
                         }
                     }

                     // Store current dimensions
                     element.dataset.prevWidth = currentWidth;
                     element.dataset.prevHeight = currentHeight;
                 }
             });
         });
     }

     createObservers() {
         // Create observers for each animation sequence
         Object.entries(this.config.sequences).forEach(([sectionName, sequence]) => {
             const sectionObserver = new IntersectionObserver(
                 (entries) => this.handleSectionIntersection(entries, sectionName),
                 this.config.observerOptions
             );

             // Observe all elements in each sequence, not just the first one
             sequence.forEach(item => {
                 const elements = document.querySelectorAll(item.selector);
                 elements.forEach(element => {
                     if (element && !this.animatedElements.has(element)) {
                         sectionObserver.observe(element);
                     }
                 });
             });

             this.observers.set(sectionName, sectionObserver);
         });
     }

     handleSectionIntersection(entries, sectionName) {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 // Find which sequence item this element belongs to
                 const sequenceItems = this.config.sequences[sectionName];
                 const matchingItem = sequenceItems.find(item =>
                     entry.target.matches(item.selector)
                 );

                 if (matchingItem) {
                     // If it's a group, animate all elements with the same selector
                     if (matchingItem.isGroup) {
                         const elements = document.querySelectorAll(matchingItem.selector);
                         elements.forEach((element, elementIndex) => {
                             this.animateElement(element, {
                                 animation: matchingItem.animation || 'fadeInUp',
                                 delay: matchingItem.delay + (elementIndex * (matchingItem.stagger || 100)),
                                 duration: matchingItem.duration || this.config.animationDefaults.duration,
                                 easing: matchingItem.easing || this.config.animationDefaults.easing
                             });
                             this.animatedElements.add(element);
                             // Stop observing this element
                             this.observers.get(sectionName).unobserve(element);
                         });
                     } else {
                         // Animate just this element
                         this.animateElement(entry.target, {
                             animation: matchingItem.animation || 'fadeInUp',
                             delay: matchingItem.delay || 0,
                             duration: matchingItem.duration || this.config.animationDefaults.duration,
                             easing: matchingItem.easing || this.config.animationDefaults.easing
                         });
                         this.animatedElements.add(entry.target);
                         // Stop observing this element
                         this.observers.get(sectionName).unobserve(entry.target);
                     }
                 }
             }
         });
     }

     animateSection(sectionName) {
         const sequence = this.config.sequences[sectionName];
         if (!sequence) return;

         sequence.forEach((item, index) => {
             const elements = document.querySelectorAll(item.selector);

             elements.forEach((element, elementIndex) => {
                 if (this.animatedElements.has(element)) return;

                 // Calculate delay with optional stagger for groups
                 const delay = item.isGroup
                     ? item.delay + (elementIndex * (item.stagger || 100))
                     : item.delay;

                 // Apply the animation
                 this.animateElement(element, {
                     animation: item.animation || 'fadeInUp',
                     delay,
                     duration: item.duration || this.config.animationDefaults.duration,
                     easing: item.easing || this.config.animationDefaults.easing
                 });

                 // Observe element for resize changes
                 if (this.resizeObserver) {
                     this.resizeObserver.observe(element);
                 }
                 this.animatedElements.add(element);
             });
         });
     }

     animateElement(element, options) {
         const {
             animation = 'fadeInUp',
             delay = 0,
             duration = this.config.animationDefaults.duration,
             easing = this.config.animationDefaults.easing
         } = options;

         // Ensure element is ready for animation
         // Don't reset opacity if it's already been set
         if (!element.style.opacity || element.style.opacity === '0') {
             element.style.opacity = '0';
         }

         element.style.willChange = 'opacity, transform';
         element.style.backfaceVisibility = 'hidden';

         // Use requestAnimationFrame for smoother animations
         requestAnimationFrame(() => {
             setTimeout(() => {
                 element.style.transition = `opacity ${duration}s ${easing}, transform ${duration}s ${easing}`;
                 element.style.opacity = '1';

                 // Apply transform based on animation type
                 switch (animation) {
                     case 'fadeInUp':
                         element.style.transform = 'translateY(0)';
                         break;
                     case 'fadeInLeft':
                         element.style.transform = 'translateX(0)';
                         break;
                     case 'fadeInRight':
                         element.style.transform = 'translateX(0)';
                         break;
                     default:
                         element.style.transform = 'none';
                 }

                 // Clean up after animation completes
                 setTimeout(() => {
                     element.style.transition = '';
                     element.style.willChange = '';
                 }, duration * 1000);
             }, delay);
         });
     }

     resetElementAnimation(element) {
         if (this.animatedElements.has(element)) {
             element.style.opacity = '0';
             element.style.transform = this.getInitialTransform(element);
             this.animatedElements.delete(element);

             // Re-observe the element
             const section = this.findElementSection(element);
             if (section && this.observers.get(section)) {
                 this.observers.get(section).observe(element);
             }
         }
     }

     getInitialTransform(element) {
         // Determine initial transform based on animation type
         if (element.classList.contains('fadeInLeft') ||
             (element.dataset.animation === 'fadeInLeft')) {
             return 'translateX(-20px)';
         }
         if (element.classList.contains('fadeInRight') ||
             (element.dataset.animation === 'fadeInRight')) {
             return 'translateX(20px)';
         }
         return 'translateY(20px)'; // Default for fadeInUp and others
     }

     findElementSection(element) {
         for (const [sectionName, sequence] of Object.entries(this.config.sequences)) {
             for (const item of sequence) {
                 if (element.matches(item.selector)) {
                     return sectionName;
                 }
             }
         }
         return null;
     }

     prepareElements() {
         // Initialize all animatable elements
         Object.values(this.config.sequences).flat().forEach(item => {
             const elements = document.querySelectorAll(item.selector);
             const animationType = item.animation || 'fadeInUp';

             elements.forEach(element => {
                 // Don't modify elements that are already animated
                 if (this.animatedElements.has(element)) return;

                 // Store the animation type for reference
                 element.dataset.animation = animationType;

                 // Apply initial state
                 element.style.opacity = '0';

                 // Apply initial transform based on animation type
                 switch (animationType) {
                     case 'fadeInUp':
                         element.style.transform = 'translateY(20px)';
                         break;
                     case 'fadeInLeft':
                         element.style.transform = 'translateX(-20px)';
                         break;
                     case 'fadeInRight':
                         element.style.transform = 'translateX(20px)';
                         break;
                 }
             });
         });
     }

     checkVisibleElements() {
         // Check if elements are already in viewport on load
         Object.entries(this.config.sequences).forEach(([sectionName, sequence]) => {
             if (sequence.length > 0) {
                 // Check all elements in each sequence, not just the first one
                 sequence.forEach(item => {
                     const elements = document.querySelectorAll(item.selector);
                     elements.forEach(element => {
                         if (element && !this.animatedElements.has(element) && this.isElementInViewport(element)) {
                             // Apply animation to elements already in viewport
                             const delay = item.isGroup ? item.delay : 0;
                             this.animateElement(element, {
                                 animation: item.animation || 'fadeInUp',
                                 delay,
                                 duration: item.duration || this.config.animationDefaults.duration,
                                 easing: item.easing || this.config.animationDefaults.easing
                             });
                             this.animatedElements.add(element);
                         }
                     });
                 });
             }
         });
     }

     isElementInViewport(element) {
         const rect = element.getBoundingClientRect();
         const windowHeight = window.innerHeight || document.documentElement.clientHeight;
         const windowWidth = window.innerWidth || document.documentElement.clientWidth;

         // Element is considered in viewport if any part of it is visible
         const verticalVisible = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
         const horizontalVisible = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

         return verticalVisible && horizontalVisible;
     }

     destroy() {
         // Clean up all observers and event listeners
         this.observers.forEach(observer => observer.disconnect());
         if (this.resizeObserver) {
             this.resizeObserver.disconnect();
         }
         window.removeEventListener('scroll', this.scrollHandler);
         window.removeEventListener('resize', this.handleResize);
         window.removeEventListener('orientationchange', this.handleResize);
         document.removeEventListener('visibilitychange', this.handleVisibilityChange);
     }
 }

 // Animation configuration remains the same
 const ANIMATION_CONFIG = {
     sequences: {
         header: [
             { selector: '.main-title', delay: 0, animation: 'fadeInUp' },
             { selector: '.intro-text', delay: 200, animation: 'fadeInUp' }
         ],
         generator: [
             { selector: '#promptSection', delay: 0, animation: 'fadeInUp' },
             { selector: '#promptInput', delay: 100, animation: 'fadeInLeft' },
             { selector: '.suggestion-chips', delay: 200, animation: 'fadeInUp' },
             { selector: '.actions', delay: 300, animation: 'fadeInRight' }
         ],
         history: [
             { selector: '#historySection', delay: 0, animation: 'fadeInUp' },
             { selector: '#historyContainer', delay: 200, animation: 'fadeInUp' }
         ],
         features: [
             { selector: '.features-section', delay: 0, animation: 'fadeInUp' },
             { selector: '.features-list', delay: 200, animation: 'fadeInUp' },
             { selector: '.feature-item', delay: 300, animation: 'fadeInUp', isGroup: true, stagger: 150 }
         ],
         steps: [
             { selector: '.steps-list', delay: 0, animation: 'fadeInUp' },
             { selector: '.step-item', delay: 100, animation: 'fadeInLeft', isGroup: true, stagger: 100 }
         ],
         keyFeatures: [
             { selector: '.key-features-section', delay: 0, animation: 'fadeInUp' },
             { selector: '.features-list', delay: 200, animation: 'fadeInUp' },
             { selector: '.feature-item', delay: 300, animation: 'fadeInUp', isGroup: true, stagger: 100 }
         ],
         benefits: [
             { selector: '.benefits-section', delay: 0, animation: 'fadeInUp' },
             { selector: '.benefits-list', delay: 200, animation: 'fadeInUp' },
             { selector: '.benefit-item', delay: 300, animation: 'fadeInUp', isGroup: true, stagger: 100 }
         ],
         users: [
             { selector: '.users-section', delay: 0, animation: 'fadeInUp' },
             { selector: '.users-list', delay: 200, animation: 'fadeInUp' },
             { selector: '.user-item', delay: 300, animation: 'fadeInUp', isGroup: true, stagger: 100 }
         ],
         faq: [
             { selector: '.faq-container', delay: 0, animation: 'fadeInUp' },
             { selector: '.faq-item', delay: 100, animation: 'fadeInUp', isGroup: true, stagger: 100 }
         ],
         cta: [
             { selector: '.cta-section', delay: 0, animation: 'fadeInUp' },
             { selector: '.cta-content h2', delay: 200, animation: 'fadeInUp' },
             { selector: '.cta-content p', delay: 300, animation: 'fadeInUp' },
             { selector: '.cta-actions', delay: 400, animation: 'fadeInUp' }
         ]
     }
 };

 // Initialize when DOM is ready
 document.addEventListener('DOMContentLoaded', () => {
     // Add base animation styles to the page if they don't exist
     if (!document.getElementById('animation-styles')) {
         const styleElement = document.createElement('style');
         styleElement.id = 'animation-styles';
         styleElement.textContent = `
     /* Base animation styles */
     [data-animation] {
       opacity: 0;
       transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                   transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
     }
     
     /* FAQ styles */
     .faq-item .faq-answer {
       overflow: hidden;
       transition: max-height 0.3s ease-out, opacity 0.2s ease;
     }
     
     .faq-item.active .faq-answer {
       opacity: 1;
     }
   `;
         document.head.appendChild(styleElement);
     }

     const animationController = new AnimationController(ANIMATION_CONFIG);

     // Make animation controller globally accessible for debugging
     window.animationController = animationController;

     // Optional: Replay animations when clicking logo (for demo purposes)
     document.querySelector('.logo')?.addEventListener('click', () => {
         animationController.animatedElements.clear();
         animationController.prepareElements();
         animationController.checkVisibleElements();
     });

     // FAQ accordion functionality
    //  document.querySelectorAll('.faq-question').forEach(question => {
    //      question.addEventListener('click', function () {
    //          const faqItem = this.closest('.faq-item');
    //          const isOpening = !faqItem.classList.contains('active');

    //          // Close all other FAQ items
    //          if (isOpening) {
    //              document.querySelectorAll('.faq-item.active').forEach(item => {
    //                  if (item !== faqItem) {
    //                      item.classList.remove('active');
    //                      const answer = item.querySelector('.faq-answer');
    //                      if (answer) {
    //                          answer.style.maxHeight = '0';
    //                      }
    //                  }
    //              });
    //          }

    //          // Toggle current item
    //          faqItem.classList.toggle('active');

    //          // Animate the answer
    //          const answer = faqItem.querySelector('.faq-answer');
    //          if (answer) {
    //              if (isOpening) {
    //                  answer.style.maxHeight = answer.scrollHeight + 'px';
    //              } else {
    //                  answer.style.maxHeight = '0';
    //              }
    //          }
    //      });
    //  });
 });

 function showError(message) {
     const resultSection = document.getElementById("resultSection");
     const errorElement = resultSection.querySelector(".error-message p");

     if (errorElement) {
         errorElement.textContent = message;
     }

     resultSection.classList.remove("loading", "success");
     resultSection.classList.add("error");
 }

 /**
  * Reset the tool to its initial state
  */
 function resetToolToInitialState() {
     // Reset global variables
     originalImage = null;
     pixelatedImage = null;

     // Reset UI elements
     const imageUpload = document.getElementById("imageUpload");
     const pixelSize = document.getElementById("pixelSize");
     const valueDisplay = document.querySelector(".value-display");
     const resultSection = document.getElementById("resultSection");
     const originalImg = document.getElementById("originalImg");
     const pixelatedImg = document.getElementById("pixelatedImg");
     const regenerateBtn = document.getElementById("regenerateBtn");
     const fileUploadContainer = document.querySelector('.file-upload-container');

     // Reset the file input
     if (imageUpload) {
         imageUpload.value = "";
     }

     // Reset the pixel size slider to default
     if (pixelSize) {
         pixelSize.value = 10;
         if (valueDisplay) {
             valueDisplay.textContent = "10px";
         }
     }

     // Clear images
     if (originalImg) {
         originalImg.src = "";
         originalImg.setAttribute("data-src", "");
         originalImg.setAttribute("data-orig-src", "");
         originalImg.style.display = 'none';
     }
     if (pixelatedImg) {
         pixelatedImg.src = "";
         pixelatedImg.setAttribute("data-src", "");
         pixelatedImg.setAttribute("data-orig-src", "");
         originalImg.style.display = 'none';
     }

     // Reset result section
     if (resultSection) {
         resultSection.classList.remove("loading", "error", "success");
     }

     // Hide regenerate button
     if (regenerateBtn) {
         regenerateBtn.classList.remove('visible');
         regenerateBtn.style.display = 'none';
     }

     // Make file upload container visible again
     if (fileUploadContainer) {
         fileUploadContainer.style.display = 'block';
     }

     // Hide actions if they have a visible class
     const actions = document.querySelector('.actions');
     if (actions) {
         actions.classList.remove('visible');
         actions.classList.remove('has-image');
         actions.style.opacity = '0';
     }

     // Hide pixelation controls
     const pixelationControls = document.querySelector('.pixelation-controls');
     if (pixelationControls) {
         pixelationControls.classList.remove('visible');
     }
 }

 async function pixelateImage(image, pixelSize) {
     try {
         // Convert image to base64
         const base64Image = await imageToBase64(image);

         // Show loading state
         document.querySelector('.loading-spinner').style.display = 'flex';
         document.querySelector('.error-message').style.display = 'none';
         document.querySelector('.generated-image').style.display = 'none';

         // Create canvas for local pixelation
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');

         canvas.width = image.width;
         canvas.height = image.height;

         // Draw original image
         ctx.drawImage(image, 0, 0);

         // Apply pixelation
         const w = canvas.width;
         const h = canvas.height;
         const pixelated = ctx.getImageData(0, 0, w, h);

         for (let y = 0; y < h; y += pixelSize) {
             for (let x = 0; x < w; x += pixelSize) {
                 const i = (y * w + x) * 4;
                 const r = pixelated.data[i];
                 const g = pixelated.data[i + 1];
                 const b = pixelated.data[i + 2];

                 for (let py = 0; py < pixelSize; py++) {
                     for (let px = 0; px < pixelSize; px++) {
                         if (y + py < h && x + px < w) {
                             const pi = ((y + py) * w + (x + px)) * 4;
                             pixelated.data[pi] = r;
                             pixelated.data[pi + 1] = g;
                             pixelated.data[pi + 2] = b;
                         }
                     }
                 }
             }
         }

         ctx.putImageData(pixelated, 0, 0);

         // Get the final image data
         const finalImageUrl = canvas.toDataURL('image/png');

         // Update the display
         const pixelatedImg = document.getElementById('pixelatedImg');
         if (pixelatedImg) {
             pixelatedImg.src = finalImageUrl;
             pixelatedImg.setAttribute("data-src", finalImageUrl);
             pixelatedImg.setAttribute("data-orig-src", finalImageUrl);
             pixelatedImg.onload = () => {
                 // Hide loading spinner and show result
                 document.querySelector('.loading-spinner').style.display = 'none';
                 document.querySelector('.generated-image').style.display = 'block';

                 // Save to session history
                 addToSessionHistory({
                     originalImage: image.src,
                     pixelatedImage: finalImageUrl,
                     pixelSize: pixelSize,
                     timestamp: new Date().toISOString()
                 });
             };
         }

         // Store the processed image
         pixelatedImage = finalImageUrl;

     } catch (error) {
         console.error('Error processing image:', error);
         showError('Failed to process image. Please try again. Error: ' + error.message);

         document.querySelector('.loading-spinner').style.display = 'none';
         document.querySelector('.error-message').style.display = 'block';
     }
 }

 function addToSessionHistory(item) {
     try {
         // Add a unique ID to the item if it doesn't have one
         if (!item.id) {
             item.id = Date.now();
         }

         // Add to session history array
         sessionHistory.unshift(item);

         // Keep only the last 10 items
         if (sessionHistory.length > 10) {
             sessionHistory = sessionHistory.slice(0, 10);
         }

         // Store in session storage
         sessionStorage.setItem('pixelationHistory', JSON.stringify(sessionHistory));

         // Update history display
         updateHistoryDisplay();
     } catch (error) {
         console.error('Error saving to session history:', error);
     }
 }

 function updateHistoryDisplay() {
     const historyContainer = document.getElementById('historyContainer');
     const emptyHistoryMessage = document.getElementById('emptyHistoryMessage');
     const historyFilterControls = document.getElementById('historyFilterControls');
     const historyPagination = document.getElementById('historyPagination');
     const clearHistoryBtn = document.getElementById('clearHistoryBtn');

     if (!historyContainer) return;

     try {
         // Get history from session storage or use the session history array
         const history = sessionHistory.length > 0 ? sessionHistory :
             JSON.parse(sessionStorage.getItem('pixelationHistory') || '[]');

         // Clear current history display
         historyContainer.innerHTML = '';

         if (history.length === 0) {
             // Show empty history message
             historyContainer.innerHTML = `
             <div class="empty-history-message" id="emptyHistoryMessage">
                 <div class="empty-icon-container">
                     <i class="fas fa-image"></i>
                 </div>
                 <p>Your generated images will appear here</p>
                 <p class="empty-history-subtitle">Create your first masterpiece!</p>
             </div>
         `;

             // Hide controls
             if (historyFilterControls) historyFilterControls.style.display = 'none';
             if (historyPagination) historyPagination.style.display = 'none';
             if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
             return;
         }

         // Show controls since we have history
         if (historyFilterControls) historyFilterControls.style.display = 'flex';
         if (historyPagination) historyPagination.style.display = 'flex';
         if (clearHistoryBtn) clearHistoryBtn.style.display = 'block';

         // Create history items
         history.forEach((item, index) => {
             const historyItem = document.createElement('div');
             historyItem.className = 'history-item';

             historyItem.innerHTML = `
             <div class="history-image-container">
                 <div class="history-image-wrapper">
                     <img src="${item.pixelatedImage}" alt="Pixelated image ${index + 1}" class="history-preview-image"
                         data-src="${item.pixelatedImage}"
                         data-orig-src="${item.pixelatedImage}">
                     <div class="history-actions">
                         <button class="btn btn-icon history-favorite" data-id="${item.id}" title="Add to favorites">
                             <i class="far fa-star"></i>
                         </button>
                         <button class="btn btn-icon history-download" data-url="${item.pixelatedImage}" title="Download">
                             <i class="fas fa-download"></i>
                         </button>
                         <button class="btn btn-icon history-delete" data-id="${item.id}" title="Remove">
                             <i class="fas fa-trash"></i>
                         </button>
             </div>
                 </div>
                     </div>
             <div class="history-info">
                 <p class="history-prompt" title="${item.prompt}">${item.prompt}</p>
                 <div class="history-meta">
                     <span class="history-date" title="${new Date(item.timestamp).toLocaleString()}">
                         <i class="far fa-clock"></i> ${formatDate(item.timestamp)}
                     </span>
                     <span class="history-style">
                         <i class="fas fa-paint-brush"></i> ${item.style || 'Smart'}
                     </span>
                     <span class="history-ratio">
                         <i class="fas fa-crop-alt"></i> ${item.ratio || '1:1'}
                     </span>
                 </div>
             </div>
         `;

             // Add event listeners for the new action buttons
             const downloadBtn = historyItem.querySelector('.history-download');
             if (downloadBtn) {
                 downloadBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     downloadHistoryImage(item.pixelatedImage);
                 });
             }
             const deleteBtn = historyItem.querySelector('.history-delete');
             if (deleteBtn) {
                 deleteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     removeHistoryItem(item.id);
                 });
             }
             const favoriteBtn = historyItem.querySelector('.history-favorite');
             if (favoriteBtn) {
                 favoriteBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     toggleFavorite(item.id);
                 });
             }

             historyContainer.appendChild(historyItem);
         });
     } catch (error) {
         console.error('Error updating history display:', error);
     }
 }

 // Helper function to convert image to base64
 function imageToBase64(image) {
     return new Promise((resolve, reject) => {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');

         // Set canvas size to match image
         canvas.width = image.width;
         canvas.height = image.height;

         // Draw image on canvas
         ctx.drawImage(image, 0, 0);

         // Convert to base64
         try {
             const base64 = canvas.toDataURL('image/jpeg');
             resolve(base64);
         } catch (error) {
             reject(error);
         }
     });
 }
 // Enhanced protection for videos against right-clicking and downloading
 document.addEventListener('DOMContentLoaded', function () {
     const protectedVideos = document.querySelectorAll('.protected-video');

     protectedVideos.forEach(video => {
         // Prevent right-click
         video.addEventListener('contextmenu', e => {
             e.preventDefault();
             return false;
         });

         // Prevent drag to disable dragging the video to desktop
         video.addEventListener('dragstart', e => {
             e.preventDefault();
             return false;
         });

         // Additional prevention for keyboard shortcuts
         video.addEventListener('keydown', e => {
             // Prevent Ctrl+S, Ctrl+U, etc.
             if (e.ctrlKey) {
                 e.preventDefault();
                 return false;
             }
         });
     });
 });
     // Carousel functionality
     document.addEventListener('DOMContentLoaded', function () {
     const toolsGrid = document.querySelector('.other-tools-grid');
     const tools = document.querySelectorAll('.other-tools-link');

     // Clone the tools to create seamless loop
     tools.forEach(tool => {
         const clone = tool.cloneNode(true);
         toolsGrid.appendChild(clone);
     });
 });
 document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.word-limit-30').forEach(function (el) {
        var text = el.textContent.trim();
        var words = text.split(/\s+/);
        if (words.length > 30) {
            el.textContent = words.slice(0, 30).join(' ') + '...';
        }
    });
});