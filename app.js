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


    if (fileInput.files.length === 0) {

        status.innerText =
            "❌ Please select a PDF first.";

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

            alert(
                "⚠️ Document Already Registered!\n\n" +
                "Document ID: " + documentId +
                "\n\n" +
                "This document ID is already registered " +
                "on the blockchain.\n\n" +
                "Please use a different Document ID."
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
                "Admin.html",
                "Verify.html"
            ) +
        "?id=" +
        encodeURIComponent(
            documentId
        );


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

