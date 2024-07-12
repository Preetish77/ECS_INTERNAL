 async function processFiles() {
            // Get selected files
            const fileInput = document.getElementById('fileInput');
            const files = fileInput.files;

            // Check if files were selected
            if (files.length === 0) {
                alert('No files selected.');
                return;
            }

            // Initialize an empty array to store all email addresses
            let allEmails = [];

            // Iterate over each selected file
            for (const file of files) {
                // Read each file as text
                const fileText = await readFileAsText(file);

                // Get filename without extension
                const filenameNoExt = file.name.replace(/\.[^/.]+$/, "");

                // Split text by lines and filter out empty lines
                const lines = fileText.split(/\r?\n/).filter(line => line.trim() !== '');

                // Append emails with corresponding filename to the array
                lines.forEach(email => {
                    allEmails.push({ 'Email': email.trim(), 'File Name': filenameNoExt });
                });
            }

            // Convert array of objects to CSV format
            const csv = convertArrayOfObjectsToCSV(allEmails);

            // Download CSV file
            downloadCSV(csv);
        }

        // Function to read file as text using FileReader API
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target.result);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsText(file);
            });
        }

        // Function to convert array of objects to CSV format
        function convertArrayOfObjectsToCSV(data) {
            const header = Object.keys(data[0]).join(',');
            const csv = data.map(row => Object.values(row).join(',')).join('\n');
            return `${header}\n${csv}`;
        }

        // Function to download CSV file with timestamped filename
        function downloadCSV(csv) {
            const currentDate = new Date();
            
            // Adjust for Central Standard Time (CST)
            const cstOffset = -6 * 60; // CST is UTC-6
            const utcTimestamp = new Date(currentDate.getTime() + cstOffset * 60000);

            const timestamp = `${utcTimestamp.getFullYear()}_${pad(utcTimestamp.getMonth() + 1)}_${pad(utcTimestamp.getDate())}_${pad(utcTimestamp.getHours())}${pad(utcTimestamp.getMinutes())}${utcTimestamp.getHours() >= 12 ? 'PM' : 'AM'}`;
            const filename = `output_${timestamp}.csv`;

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Function to pad numbers with leading zeros
        function pad(num) {
            return num.toString().padStart(2, '0');
        }
