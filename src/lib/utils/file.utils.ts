export function fileToFileList(file: File) {
	const dataTransfer = new DataTransfer();
	dataTransfer.items.add(file);
	const fileList = dataTransfer.files;

	return fileList;
}
