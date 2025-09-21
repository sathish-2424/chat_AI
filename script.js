const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const promptInput = document.querySelector(".prompt-input");
const imageGallery = document.querySelector(".image-gallery");

// Replace with your actual API key
const KEY = "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"; 
let isImageGenerating = false;

const updateImageCard = (srcUrl) => {
    const imgCard = document.querySelector(".img-card");
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    imgElement.src = srcUrl;
   
    imgElement.onload = () => {
        imgCard.classList.remove("loading");
        downloadBtn.setAttribute("href", srcUrl);
        downloadBtn.setAttribute("download", `${promptInput.value}.jpg`);
    };

    // Handle image load errors
    imgElement.onerror = () => {
        showError("Failed to load generated image");
        resetGenerateButton();
    };
};

const showError = (message) => {
    console.error("Error:", message);
    const errorMarkup = `
        <div class="img-card error">
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    imageGallery.innerHTML = errorMarkup;
};

const resetGenerateButton = () => {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
};

const query = async () => {
    try {
        console.log("Starting API request...");
        console.log("Prompt:", promptInput.value);
        console.log("API Key (first 10 chars):", KEY.substring(0, 10) + "...");
        
        // Try the most reliable model first
        const apiUrl = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
        
        console.log("API URL:", apiUrl);
        
        const requestBody = {
            "inputs": promptInput.value,
            "parameters": {
                "num_inference_steps": 20,
                "guidance_scale": 7.5
            }
        };
        
        console.log("Request body:", JSON.stringify(requestBody));

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        
        // Get response text for debugging
        const responseText = await response.text();
        console.log("Response text:", responseText);

        // Check if the response is ok
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("❌ Invalid API key. Please check your token at https://huggingface.co/settings/tokens");
            } else if (response.status === 429) {
                throw new Error("⏰ Rate limit exceeded. Please try again in a few minutes.");
            } else if (response.status === 400) {
                throw new Error("🚫 Invalid prompt. Try a simpler description like 'red apple' or 'blue sky'.");
            } else if (response.status === 404) {
                throw new Error("❓ Model not found. Trying alternative model...");
            } else if (response.status === 503) {
                throw new Error("⏳ Model is loading. Please wait 30 seconds and try again.");
            } else {
                throw new Error(`🔥 API Error: ${response.status} - ${response.statusText}\nResponse: ${responseText}`);
            }
        }

        // Try to parse as blob
        const blob = new Blob([responseText], { type: 'image/jpeg' });
        
        console.log("Blob size:", blob.size);
        
        // Check if we actually got an image
        if (blob.size === 0) {
            throw new Error("No image data received from API");
        }

        return blob;

    } catch (error) {
        console.error("API Error Details:", error);
        throw error;
    }
};

// Alternative query function with different model
const queryAlternative = async () => {
    try {
        console.log("Trying alternative model...");
        const response = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                headers: {
                    Authorization: `Bearer ${KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    "inputs": promptInput.value
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Alternative model failed: ${response.status}`);
        }

        const result = await response.blob();
        return result;
    } catch (error) {
        console.error("Alternative model error:", error);
        throw error;
    }
};

const generateAiImages = async () => {
    try {
        console.log("=== Starting image generation ===");
        
        // Try main model first
        let response;
        try {
            response = await query();
        } catch (error) {
            console.log("Main model failed, trying alternative...");
            response = await queryAlternative();
        }
        
        const objectURL = URL.createObjectURL(response);
        console.log("Generated image URL:", objectURL);
        updateImageCard(objectURL);
        resetGenerateButton();
        
    } catch (error) {
        console.error("Generation failed:", error);
        showError(error.message);
        resetGenerateButton();
    }
};

const handleImageGeneration = (e) => {
    e.preventDefault();
    
    console.log("=== Image generation started ===");
    
    // Prevent multiple simultaneous requests
    if (isImageGenerating) {
        console.log("Already generating, skipping...");
        return;
    }

    // Validate input
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showError("Please enter a description for the image you want to generate.");
        return;
    }

    // Check API key
    if (!KEY || KEY === "Your api key here") {
        showError("Please add your Hugging Face API key to use this generator.");
        return;
    }

    console.log("Validation passed, starting generation...");

    // Set loading state
    generateBtn.setAttribute("disabled", true);
    generateBtn.innerText = "Generating...";
    isImageGenerating = true;

    // Create loading card
    const imgCardMarkup = `
        <div class="img-card loading">
            <img src="images/loader.svg" alt="AI generated image">
            <a class="download-btn" href="#" >
                <img src="images/download.svg" alt="download icon">
            </a>
        </div>
    `;

    imageGallery.innerHTML = imgCardMarkup;
    
    // Generate image
    generateAiImages();
};

// Test API key validity on page load
const testApiKey = async () => {
    try {
        console.log("Testing API key...");
        const response = await fetch("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5", {
            headers: {
                Authorization: `Bearer ${KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({"inputs": "test"}),
        });
        
        console.log("API key test response:", response.status);
        
        if (response.status === 401) {
            showError("❌ Invalid API key detected. Please check your token.");
        } else if (response.status === 503) {
            console.log("✅ API key is valid, model is loading");
        } else {
            console.log("✅ API key appears to be valid");
        }
    } catch (error) {
        console.error("API key test failed:", error);
    }
};

// Add event listeners
generateForm.addEventListener("submit", handleImageGeneration);

// Optional: Add Enter key support for input field
promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleImageGeneration(e);
    }
});

// Test API key when page loads
window.addEventListener("load", testApiKey);
