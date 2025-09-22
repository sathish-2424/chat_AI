/* --------------------------------------------------------------
   Configuration
   -------------------------------------------------------------- */
// 1️⃣ Your personal Hugging Face inference token (starts with "hf_")
const API_KEY = "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"; // IMPORTANT: Replace with your actual key

// 2️⃣ Primary model – we are using SDXL Base
const MAIN_MODEL_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

// Optional fallback (kept as a safety net)
const ALT_MODEL_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

/* --------------------------------------------------------------
   DOM references
   -------------------------------------------------------------- */
const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const promptInput = generateForm.querySelector(".prompt-input");
const imageGallery = document.querySelector(".image-gallery");

/* --------------------------------------------------------------
   Helper UI functions
   -------------------------------------------------------------- */
function setLoadingState(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.textContent = "Generating...";
    } else {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate";
    }
}

/* Show a nice error card */
function showError(message) {
    const markup = `
        <div class="img-card error">
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        </div>`;
    imageGallery.innerHTML = markup;
}

/* Insert a loading card while we wait for the API */
function showLoadingCard() {
    const markup = `
        <div class="img-card loading">
            <img src="images/loader.svg" alt="loading spinner">
            <a class="download-btn" href="#">
                <img src="images/download.svg" alt="download icon">
            </a>
        </div>`;
    imageGallery.innerHTML = markup;
}

/* Update the displayed image and enable download */
function updateImageCard(blobUrl) {
    const imgCard = document.querySelector(".img-card");
    const imgEl = imgCard.querySelector("img");
    const dlBtn = imgCard.querySelector(".download-btn");

    imgEl.src = blobUrl;

    imgEl.onload = () => {
        imgCard.classList.remove("loading");
        dlBtn.href = blobUrl;
        dlBtn.download = `${promptInput.value.trim() || "generated"}.jpg`;
    };

    imgEl.onerror = () => {
        showError("Failed to load the generated image.");
        setLoadingState(false);
    };
}

/* --------------------------------------------------------------
   API calls
   -------------------------------------------------------------- */
async function callModel(url) {
    const payload = {
        inputs: promptInput.value.trim(),
        parameters: { num_inference_steps: 20, guidance_scale: 7.5 }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const txt = await response.text(); // Capture error body for debugging
        // Build a helpful error based on status code
        switch (response.status) {
            case 401: throw new Error("❌ Invalid API key. Check your token at https://huggingface.co/settings/tokens");
            case 429: throw new Error("⏰ Rate limit exceeded. Try again in a minute.");
            case 400: throw new Error("🚫 Bad request – maybe the prompt is too long or malformed.");
            case 404: throw new Error("❓ Model not found. (Will try an alternative.)");
            case 503: throw new Error("⏳ Model is loading. Wait a few seconds and retry.");
            default: throw new Error(`🔥 API error ${response.status}: ${txt}`);
        }
    }

    // The endpoint returns raw image bytes → read as Blob
    const blob = await response.blob();

    if (!blob.type.startsWith("image/") || blob.size === 0) {
        throw new Error("Received an empty or non-image response from the model.");
    }
    return blob;
}

/* Try main model first, fall back to alternative if appropriate */
async function generateImage() {
    try {
        // Primary model
        return await callModel(MAIN_MODEL_URL);
    } catch (err) {
        // If the failure is due to the model itself (404/503), try the alternative
        if (err.message.includes("404") || err.message.includes("503")) {
            console.warn("Primary model failed – attempting alternative model.", err);
            return await callModel(ALT_MODEL_URL);
        }
        // Otherwise re-throw – it’s probably an auth or rate-limit issue
        throw err;
    }
}

/* --------------------------------------------------------------
   Event handling
   -------------------------------------------------------------- */
async function handleSubmit(event) {
    event.preventDefault();

    // 1️⃣ Validation
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showError("Please type a description for the image you’d like to generate.");
        return;
    }
    if (!API_KEY || API_KEY.startsWith("YOUR_")) {
        showError("A valid Hugging Face API key is required. Insert it in script.js.");
        return;
    }

    // 2️⃣ UI preparation
    setLoadingState(true);
    showLoadingCard();

    // 3️⃣ Call the model(s)
    try {
        const imageBlob = await generateImage();
        const blobUrl = URL.createObjectURL(imageBlob);
        updateImageCard(blobUrl);
    } catch (err) {
        console.error(err);
        showError(err.message);
    } finally {
        setLoadingState(false);
    }
}

/* ------------------------------------------------------------------
   Attach listeners
   ------------------------------------------------------------------ */
generateForm.addEventListener("submit", handleSubmit);

/* Optional: allow pressing Enter while focused on the input */
promptInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
		e.preventDefault(); // Prevent form submission if it's not already handled
		handleSubmit(e);
	}
});

/* ------------------------------------------------------------------
   Optional: quick test of the API key on page load (helps debug)
   ------------------------------------------------------------------ */
async function testApiKey() {
    if (!API_KEY || API_KEY.startsWith("YOUR_")) return; // skip placeholder
    try {
        const resp = await fetch("https://huggingface.co/api/whoami", {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        console.log("✅ API key works!");
    } catch (e) {
        console.warn("API key test failed:", e);
    }
}
window.addEventListener("load", testApiKey);
