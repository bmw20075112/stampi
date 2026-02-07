declare module 'heic2any' {
	function heic2any(options: {
		blob: Blob;
		toType?: string;
		quality?: number;
		multiple?: true;
		gifInterval?: number;
	}): Promise<Blob | Blob[]>;

	export default heic2any;
}
