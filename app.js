async function generateHash() {

    const fileInput =
        document.getElementById("documentFile");

    const hashField =
        document.getElementById("documentHash");

    const status =
        document.getElementById("status");


    if (!fileInput || !hashField || !status) {

        console.error(
            "Required HTML elements were not found."
        );

        return;
    }


    // Clear previous errors

document.getElementById(
    "documentIdError"
).style.display = "none";

document.getElementById(
    "documentFileError"
).style.display = "none";

document.getElementById(
    "documentId"
).classList.remove("input-error");

document.getElementById(
    "documentFile"
).classList.remove("input-error");


// Check Document ID

const documentId =
    document.getElementById(
        "documentId"
    ).value.trim();


// Check PDF

if (!documentId) {

    const error =
        document.getElementById(
            "documentIdError"
        );

    error.innerText =
        "⚠️ Please enter a Document ID.";

    error.style.display =
        "block";

    document.getElementById(
        "documentId"
    ).classList.add(
        "input-error"
    );

    document.getElementById(
        "documentId"
    ).focus();

    status.innerText =
        "⚠️ Please complete the required field.";

    return;
}


if (fileInput.files.length === 0) {

    const error =
        document.getElementById(
            "documentFileError"
        );

    error.innerText =
        "⚠️ Please select a PDF document.";

    error.style.display =
        "block";

    document.getElementById(
        "documentFile"
    ).classList.add(
        "input-error"
    );

    status.innerText =
        "⚠️ Please select a PDF.";

    return;
}


    try {

        const file =
            fileInput.files[0];


        status.innerText =
            "⏳ Generating SHA-256 hash...";


        const fileBuffer =
            await file.arrayBuffer();


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                fileBuffer
            );


        const hashArray =
            new Uint8Array(hashBuffer);


        const hash =
            "0x" +
            Array.from(hashArray)
                .map(
                    byte =>
                        byte
                            .toString(16)
                            .padStart(2, "0")
                )
                .join("");


        hashField.value =
            hash;


        status.innerText =
            "✅ Hash generated successfully!";


        console.log(
            "PDF:",
            file.name
        );

        console.log(
            "SHA-256:",
            hash
        );

        console.log(
            "Hash length:",
            hash.length
        );


    } catch (error) {

        console.error(
            "Hash generation error:",
            error
        );


        status.innerText =
            "❌ Hash generation failed.";
    }
}

async function verifyDocument() {

    const documentId =
        document.getElementById("verifyDocumentId").value.trim();

    const fileInput =
        document.getElementById("verifyDocumentFile");

    const status =
        document.getElementById("verifyStatus");

    const result =
        document.getElementById("result");


    result.innerHTML = "";


    // Check Document ID

    if (!documentId) {

        status.innerText =
            "❌ Please enter a Document ID.";

        return;
    }


    // Check PDF

    if (fileInput.files.length === 0) {

        status.innerText =
            "❌ Please select a PDF.";

        return;
    }


    try {

        status.innerText =
            "⏳ Generating document hash...";


        // Get selected PDF

        const file =
            fileInput.files[0];


        // Read PDF

        const fileBuffer =
            await file.arrayBuffer();


        // Convert PDF to bytes

        const hashBuffer =
    await crypto.subtle.digest(
        "SHA-256",
        fileBuffer
    );

const hashArray =
    new Uint8Array(hashBuffer);

const uploadedHash =
    "0x" +
    Array.from(hashArray)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");


        console.log(
            "Uploaded PDF:",
            file.name
        );

        console.log(
            "Uploaded Hash:",
            uploadedHash
        );


        status.innerText =
            "🔗 Connecting to Sepolia blockchain...";


        // READ-ONLY Sepolia provider
        // No MetaMask required

        const provider =
            new ethers.JsonRpcProvider(
                "https://ethereum-sepolia-rpc.publicnode.com"
            );


        // Connect to smart contract in read-only mode

        const contract =
            new ethers.Contract(
                contractAddress,
                contractABI,
                provider
            );


        status.innerText =
            "🔍 Checking blockchain...";


        // Read document from blockchain

        const data =
            await contract.verifyDocument(
                documentId
            );


        const storedDocumentId =
            data[0];

        const storedHash =
            data[1];

        const issuer =
            data[2];

        const timestamp =
            data[3];

        const exists =
            data[4];


        console.log(
            "Blockchain data:",
            data
        );


        // Document does not exist

        if (!exists) {

    status.innerText =
        "❌ Document not found.";

    result.className =
        "result not-found";

    result.innerHTML = `
        <h2>⚠️ DOCUMENT NOT FOUND</h2>

        <p>
            <strong>Document ID:</strong>
            ${documentId}
        </p>

        <p>
            This document is not registered
            on the blockchain.
        </p>
    `;

    return;
}


        // Compare hashes

        if (
            uploadedHash.toLowerCase() ===
            storedHash.toLowerCase()
        ) {

            status.innerText =
                "✅ Document verified successfully!";


            result.className =
    "result verified";

    result.innerHTML = `
        <h2>✅ DOCUMENT VERIFIED</h2>

    <p>
        <strong>Document ID:</strong>
        ${storedDocumentId}
    </p>

    <p>
        <strong>Status:</strong>
        Original / Authentic
    </p>

    <p>
        <strong>Issuer:</strong>
        ${issuer}
    </p>

    <p>
        <strong>Blockchain Hash:</strong>
        ${storedHash}
    </p>
`;

        } else {

            result.className ="result invalid";

            result.innerHTML = `
                <h2>❌ INVALID DOCUMENT</h2>

    <p>
        <strong>Document ID:</strong>
        ${documentId}
    </p>

    <p>
        The uploaded PDF has a different
        hash from the document stored
        on the blockchain.
    </p>

    <p>
        <strong>Blockchain Hash:</strong>
        ${storedHash}
    </p>

    <p>
        <strong>Uploaded Hash:</strong>
        ${uploadedHash}
    </p>
`;
        }


    } catch (error) {

        console.error(
            "Verification Error:",
            error
        );


        status.innerText =
            "❌ Verification failed. Check browser console.";

    }
}

async function copyHash() {

    const hashField =
        document.getElementById("documentHash");

    const status =
        document.getElementById("status");

    const hash =
        hashField.value.trim();

    if (!hash) {

        status.innerText =
            "❌ Generate the hash first.";

        return;
    }

    try {

        await navigator.clipboard.writeText(hash);

        status.innerText =
            "✅ Hash copied to clipboard!";

    } catch (error) {

        console.error("Copy error:", error);

        // Fallback method
        hashField.select();
        hashField.setSelectionRange(0, 99999);

        document.execCommand("copy");

        status.innerText =
            "✅ Hash copied to clipboard!";
    }
}

async function registerDocument() {

    const documentId =
        document.getElementById("documentId").value.trim();

    const hash =
        document.getElementById("documentHash").value.trim();

    const status =
        document.getElementById("status");

    const documentFile =
    document.getElementById(
        "documentFile"
    );


// Clear previous errors

document.getElementById(
    "documentIdError"
).style.display = "none";

document.getElementById(
    "documentFileError"
).style.display = "none";


// Check Document ID

if (!documentId) {

    const error =
        document.getElementById(
            "documentIdError"
        );

    error.innerText =
        "⚠️ Please enter a Document ID.";

    error.style.display =
        "block";

    document.getElementById(
        "documentId"
    ).classList.add(
        "input-error"
    );

    document.getElementById(
        "documentId"
    ).focus();

    status.innerText =
        "⚠️ Please enter the required information.";

    return;
}


// Check PDF

if (documentFile.files.length === 0) {

    const error =
        document.getElementById(
            "documentFileError"
        );

    error.innerText =
        "⚠️ Please select a PDF document.";

    error.style.display =
        "block";

    document.getElementById(
        "documentFile"
    ).classList.add(
        "input-error"
    );

    status.innerText =
        "⚠️ Please select the PDF document.";

    return;
}


// Check hash

if (!hash) {

    status.innerText =
        "⚠️ Please generate the document hash first.";

    return;
}
    if (!documentId) {

        alert("⚠️ Please enter a Document ID.");

        return;
    }


    if (!hash) {

        alert("⚠️ Please generate the document hash first.");

        return;
    }


    try {

        // --------------------------------
        // STEP 1: Check blockchain
        // --------------------------------

        status.innerText =
            "🔍 Checking whether document is already registered...";


        const readProvider =
            new ethers.JsonRpcProvider(
                "https://ethereum-sepolia-rpc.publicnode.com"
            );


        const readContract =
            new ethers.Contract(
                contractAddress,
                contractABI,
                readProvider
            );


        const existingDocument =
            await readContract.verifyDocument(
                documentId
            );


        const exists =
            existingDocument[4];


        // --------------------------------
        // Document already exists
        // --------------------------------

        if (exists) {

    status.innerText =
        "⚠️ Document already registered.";

    showPopup(
        "Document Already Registered",
        "Document ID " +
        documentId +
        " is already registered on the blockchain. Please use a different Document ID.",
        "⚠️"
    );

    return;
}


        // --------------------------------
        // STEP 2: Check MetaMask
        // --------------------------------

        if (!window.ethereum) {

            status.innerText =
                "❌ MetaMask not detected.";

            alert(
                "❌ MetaMask is not installed."
            );

            return;
        }


        status.innerText =
            "🔗 Connecting to MetaMask...";


        await window.ethereum.request({
            method: "eth_requestAccounts"
        });


        const provider =
            new ethers.BrowserProvider(
                window.ethereum
            );


        const signer =
            await provider.getSigner();


        const contract =
            new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );


        // --------------------------------
        // STEP 3: Register
        // --------------------------------

        status.innerText =
            "⏳ Sending transaction to blockchain...";


        const transaction =
            await contract.registerDocument(
                documentId,
                hash
            );


        console.log(
            "Transaction hash:",
            transaction.hash
        );


        status.innerText =
            "⏳ Waiting for confirmation...";


        await transaction.wait();


       status.innerText =
    "✅ Document registered successfully!";


// Get registration details

const registeredData =
    await readContract.verifyDocument(
        documentId
    );

const registeredIssuer =
    registeredData[2];

const registeredTimestamp =
    registeredData[3];


// Convert blockchain timestamp

const registrationDate =
    new Date(
        Number(registeredTimestamp) * 1000
    );


// Display transaction details

const transactionLink =
    "https://sepolia.etherscan.io/tx/" +
    transaction.hash;


const details =
    document.getElementById(
        "registrationDetails"
    );


if (details) {

    details.style.display =
        "block";

    details.innerHTML = `
        <h2>✅ Document Registered</h2>

        <p>
            <strong>Document ID:</strong>
            ${documentId}
        </p>

        <p>
            <strong>Issuer:</strong>
            ${registeredIssuer}
        </p>

        <p>
            <strong>Registered:</strong>
            ${registrationDate.toLocaleString()}
        </p>

        <p>
            <strong>Network:</strong>
            Ethereum Sepolia
        </p>

        <p>
            <strong>Transaction:</strong><br>
            ${transaction.hash}
        </p>

        <a
            href="${transactionLink}"
            target="_blank"
            class="button">

            🔗 View on Sepolia Explorer

        </a>
    `;
}


        alert(
            "✅ Document Registered Successfully!\n\n" +
            "Document ID: " + documentId
        );


        // --------------------------------
        // STEP 4: Generate QR
        // --------------------------------

        if (typeof generateQRCode === "function") {

            generateQRCode(documentId);


            const qrSection =
                document.getElementById(
                    "qrSection"
                );


            if (qrSection) {

                qrSection.style.display =
                    "block";
            }
        }


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );


        if (
            error.code === 4001 ||
            error.code === "ACTION_REJECTED"
        ) {

            status.innerText =
                "❌ Transaction rejected in MetaMask.";

        } else {

            status.innerText =
                "❌ Registration failed.";

            alert(
                "❌ Registration failed.\n\n" +
                "Check the browser console for details."
            );
        }
    }
}

function generateQRCode(documentId) {

    const qrContainer =
        document.getElementById("qrcode");


    if (!qrContainer) {

        return;
    }


    // Remove previous QR code

    qrContainer.innerHTML = "";


    // Current website URL

   const verificationURL =
    window.location.origin +
    window.location.pathname
        .replace(
            "admin.html",
            "verify.html"
        ) +
    "?id=" +
    encodeURIComponent(documentId);


    console.log(
        "QR Verification URL:",
        verificationURL
    );


    new QRCode(
        qrContainer,
        {
            text: verificationURL,

            width: 200,

            height: 200
        }
    );
}

function downloadQRCode() {

    const qrContainer =
        document.getElementById("qrcode");


    const canvas =
        qrContainer.querySelector("canvas");


    if (!canvas) {

        alert(
            "Please register the document first."
        );

        return;
    }


    const link =
        document.createElement("a");


    link.download =
        "Document-QR.png";


    link.href =
        canvas.toDataURL("image/png");


    link.click();
}

function loadDocumentIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const documentId =
        params.get("id");


    if (documentId) {

        const input =
            document.getElementById(
                "verifyDocumentId"
            );


        if (input) {

            input.value =
                documentId;

            input.readOnly = true;

        }
    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadDocumentIdFromURL
);

function showPopup(
    title,
    message,
    icon = "⚠️"
) {

    const overlay =
        document.getElementById("popupOverlay");

    const popupTitle =
        document.getElementById("popupTitle");

    const popupMessage =
        document.getElementById("popupMessage");

    const popupIcon =
        document.getElementById("popupIcon");


    if (!overlay) {
        return;
    }


    popupTitle.innerText =
        title;

    popupMessage.innerText =
        message;

    popupIcon.innerText =
        icon;


    overlay.style.display =
        "flex";
}


function closePopup() {

    const overlay =
        document.getElementById("popupOverlay");


    if (overlay) {

        overlay.style.display =
            "none";
    }
}
