import Compressor from "compressorjs";

type CompressImgProps = {
	file: File;
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
};

export default function compressImg({
	file,
	maxWidth = 500,
	maxHeight = 500,
	quality = 0.6,
}: CompressImgProps): Promise<File> {
	return new Promise((resolve, reject) => {
		new Compressor(file, {
			maxHeight,
			maxWidth,
			quality,
			mimeType: "image/jpeg",
			success(optimizedBlob: Blob) {
                const optimizedFile = new File([optimizedBlob], file.name, {
                    type: optimizedBlob.type,
                    lastModified: Date.now(),
                });
				resolve(optimizedFile);
			},
			error(err: Error) {
				reject(err);
			},
		});
	});
}
