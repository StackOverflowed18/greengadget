document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_ENDPOINT = 'https://ewaste-estimator-app.onrender.com';  // Ensure this is correct

    // --- Get DOM Elements ---
    const uploadForm = document.getElementById('upload-form');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const fileNameDisplay = document.getElementById('file-name-display');
    const brandInput = document.getElementById('brand');
    const modelInput = document.getElementById('model');
    const issuesInput = document.getElementById('issues');
    const submitButton = document.getElementById('submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const spinner = submitButton.querySelector('.spinner');
    const statusMessage = document.getElementById('status-message');
    const resultsDisplay = document.getElementById('results-display');
    const priceRangeDisplay = document.getElementById('price-range');
    const detectedInfoDisplay = document.getElementById('detected-info');

    // --- Reset UI on Load ---
    function resetUI() {
        fileNameDisplay.textContent = 'No file chosen';
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';
        clearStatus();
        resultsDisplay.classList.add('hidden');
    }
    resetUI();

    // --- Event Listeners ---

    // Handle file selection and preview
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name.length > 30 ? `${file.name.substring(0, 27)}...` : file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
            clearStatus();
            resultsDisplay.classList.add('hidden');
        } else {
            resetUI();
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const file = imageUpload.files[0];
        if (!file) {
            showStatus('Please select an image file first.', 'error');
            return;
        }

        // --- Prepare UI for loading ---
        setLoadingState(true);
        clearStatus();
        resultsDisplay.classList.add('hidden');

        // --- Prepare API call ---
        const formData = new FormData();
        formData.append('image', file);
        formData.append('brand', brandInput.value.trim());
        formData.append('model', modelInput.value.trim());
        formData.append('issues', issuesInput.value.trim());

        try {
            const response = await fetch(`${API_ENDPOINT}/estimate`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                displayResults(result);
            } else {
                let errorMsg = `Error: ${response.status} - ${response.statusText}`;
                try {
                    const errorResult = await response.json();
                    if (errorResult && errorResult.error) {
                        errorMsg = `Error: ${errorResult.error}`;
                    }
                } catch (e) {
                    console.warn("Could not parse error response:", e);
                }
                showStatus(errorMsg, 'error');
                resultsDisplay.classList.add('hidden');
            }
        } catch (error) {
            console.error('Network Error:', error);
            showStatus('Network Error: Could not connect to the estimation server. Please try again later.', 'error');
            resultsDisplay.classList.add('hidden');
        } finally {
            setLoadingState(false);
        }
    });

    // --- Helper Functions ---
    function setLoadingState(isLoading) {
        submitButton.disabled = isLoading;
        buttonText.textContent = isLoading ? 'Processing...' : 'Get Estimate';
        spinner.classList.toggle('hidden', !isLoading);
    }

    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = 'status';
        if (type === 'error') {
            statusMessage.classList.add('error');
        } else if (type === 'loading') {
            statusMessage.classList.add('loading');
        }
    }

    function clearStatus() {
        statusMessage.textContent = '';
        statusMessage.className = 'status';
    }

    function displayResults(result) {
        priceRangeDisplay.textContent = result.estimated_price || 'N/A';
        detectedInfoDisplay.textContent = result.detected_info || 'Analysis details not available.';
        resultsDisplay.classList.remove('hidden');
    }
});
