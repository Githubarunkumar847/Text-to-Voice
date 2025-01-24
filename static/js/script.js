document.addEventListener("DOMContentLoaded", () => {
    const textForm = document.getElementById("textForm");
    const textArea = document.getElementById("text");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const audioContainer = document.getElementById("audioContainer");
    const playAudio = document.getElementById("playAudio");
    const downloadLink = document.getElementById("downloadLink");
    const themeToggle = document.getElementById("themeToggle");

    // Function to fetch progress from the server
    const fetchProgress = async () => {
        try {
            const response = await fetch("/progress");
            if (response.ok) {
                const { status, message } = await response.json();
                progressBar.style.width = `${status}%`;
                progressText.textContent = message;

                if (status === 100) {
                    clearInterval(progressInterval);
                    progressContainer.style.display = "none";
                }
            } else {
                throw new Error("Failed to fetch progress.");
            }
        } catch (error) {
            console.error("Error fetching progress:", error);
        }
    };

    // Submit Form
    textForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = textArea.value.trim();

        if (!text) {
            alert("Please enter text to convert.");
            return;
        }

        // Reset UI
        audioContainer.style.display = "none";
        progressContainer.style.display = "block";
        progressBar.style.width = "0%";
        progressText.style.display = "block";
        progressText.textContent = "Initializing...";

        try {
            // Start periodic progress fetching
            const progressInterval = setInterval(fetchProgress, 500);

            const response = await fetch("/convert", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ text }),
            });

            clearInterval(progressInterval);

            if (response.ok) {
                const { audio_url } = await response.json();

                // Play Audio
                const audio = new Audio(audio_url);
                let isPlaying = false;

                playAudio.onclick = () => {
                    if (isPlaying) {
                        audio.pause();
                        playAudio.classList.replace("bi-pause-circle", "bi-play-circle");
                    } else {
                        audio.play();
                        playAudio.classList.replace("bi-play-circle", "bi-pause-circle");
                    }
                    isPlaying = !isPlaying;
                };

                audio.onended = () => {
                    isPlaying = false;
                    playAudio.classList.replace("bi-pause-circle", "bi-play-circle");
                };

                downloadLink.href = audio_url;
                audioContainer.style.display = "block";
            } else {
                alert("Error: " + (await response.json()).error);
            }
        } catch (err) {
            alert("An unexpected error occurred. Please try again.");
        } finally {
            progressContainer.style.display = "none";
            progressText.style.display = "none";
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        const contactUsBtn = document.querySelector(".contact-us-btn");
    
        if (contactUsBtn) {
            contactUsBtn.addEventListener("click", (e) => {
                e.preventDefault(); // Prevent default navigation for smooth scroll
                const targetUrl = contactUsBtn.getAttribute("href");
                document.body.classList.add("fade-out"); // Optional fade effect
                setTimeout(() => (window.location.href = targetUrl), 300); // Navigate after effect
            });
        }
    });    
  
    // Theme Toggle
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        document.body.classList.toggle("light");
        themeToggle.textContent = document.body.classList.contains("dark")
            ? "Switch to Light Mode"
            : "Switch to Dark Mode";
    });
});
