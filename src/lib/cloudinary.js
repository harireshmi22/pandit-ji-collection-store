export const uploadToCloudinary = async (file) => {
	if (!file) return null;

	const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
	const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET; // You'll need to set this up in Cloudinary settings

	// TODO: Add Cloudinary credentials to .env.local
	if (!cloudName || !uploadPreset) {
		console.warn(
			"Cloudinary credentials missing. Falling back to base64 (not recommended for production).",
		);
		// Fallback to base64 if no keys (maintain current behavior but warn)
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}

	console.log("Cloudinary upload starting:", {
		cloudName,
		uploadPreset,
		fileName: file.name,
		fileSize: file.size,
		fileType: file.type,
	});

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", uploadPreset);

	try {
		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
			{
				method: "POST",
				body: formData,
			},
		);

		console.log("Cloudinary response status:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Cloudinary error response:", errorText);
			throw new Error(
				`Cloudinary upload failed: ${response.status} ${errorText}`,
			);
		}

		const data = await response.json();
		console.log("Cloudinary upload successful:", data.secure_url);
		return data.secure_url;
	} catch (error) {
		console.error("Error uploading to Cloudinary:", error);
		throw error;
	}
};
