(function ($, $$) {
	const SELECTOR = '.cropper, [mv-cropper-options]';

	let defaults = {
		viewMode: 3,
		autoCropArea: 1,
		checkCrossOrigin: false
	};

	let options;

	Mavo.Plugins.register('cropper', {
		dependencies: [
			'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.1/cropper.min.css',
			'mv-cropper.css'
		],
		ready: $.include(self.cropper, 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.1/cropper.min.js'),
	});

	Mavo.Elements.register('cropper', {
		default: true,
		selector: SELECTOR,
		attribute: 'src',
		hasChildren: false,

		init: function () {

			options = this.element.getAttribute('mv-cropper-options');

			if (options) {
				options = $.extend(defaults, Mavo.options(options));
			} else {
				options = defaults;
			}
		},

		editor: function () {
			let fileName = this.element.src.split('/').pop();
			let fileType = 'image/' + (fileName.split('.')[1] === 'png' ? 'png' : 'jpeg');
			let tempURL;

			Mavo.setAttributeShy(this.element, 'mv-uploads', 'images');
			// Generate the default editor
			const popup = this.createUploadPopup('image/*', 'image', 'png');

			// and extend it with appropriate elements
			$.create('div', {
				// Wrap the image element with a block element (container)
				className: 'cropper-wrapper',
				// Do we really need to style it here?
				style: {
					maxWidth: this.element.offsetWidth + 'px'
				},
				contents: [{
					tag: 'img',
					src: this.element.src,
					alt: this.mavo._('cropper-image-preview'),
					className: 'cropper-preview',
					// Limit image width and height to avoid overflow the container
					style: {
						maxWidth: '100%',
						maxHeight: '100%'
					}
				}],
				inside: popup
			});

			// Create the cropper
			this.cropper = new Cropper($('.cropper-preview', popup), options);

			// TODO: Generate the cropper-bar depending on the Cropper options: this.cropper.options
			$.create('div', {
				className: 'cropper-bar',
				contents: {
					tag: 'button',
					className: 'cropper-upload',
					type: 'button',
					textContent: this.mavo._('cropper-upload'),
					title: this.mavo._('cropper-upload'),
					events: {
						click: function () {
							this.cropper.getCroppedCanvas(
								fileType === 'image/png' ? {} : { fillColor: '#fff' }
							).toBlob(file => {
								this.upload(file, fileName);
							}, fileType);
						}.bind(this)
					}
				},
				inside: popup
			});

			// Rotate
			if (this.cropper.options.rotatable) {
				$.create('button', {
					type: 'button',
					className: 'cropper-rotate-left',
					textContent: this.mavo._('cropper-rotate-left'),
					title: this.mavo._('cropper-rotate-left'),
					events: {
						click: () => {
							this.cropper.rotate(-90);
						}
					},
					inside: $('.cropper-bar', popup)
				});
				$.create('button', {
					type: 'button',
					className: 'cropper-rotate-right',
					textContent: this.mavo._('cropper-rotate-right'),
					title: this.mavo._('cropper-rotate-right'),
					events: {
						click: () => {
							this.cropper.rotate(90);
						}
					},
					inside: $('.cropper-bar', popup)
				});
			}

			// Flip
			if (this.cropper.options.scalable) {
				$.create('button', {
					type: 'button',
					className: 'cropper-flip-horizontal',
					textContent: this.mavo._('cropper-flip-horizontal'),
					title: this.mavo._('cropper-flip-horizontal'),
					events: {
						click: () => {
							this.cropper.scaleX(-this.cropper.getData().scaleX || -1);
						}
					},
					inside: $('.cropper-bar', popup)
				});
				$.create('button', {
					type: 'button',
					className: 'cropper-flip-vertical',
					textContent: this.mavo._('cropper-flip-vertical'),
					title: this.mavo._('cropper-flip-vertical'),
					events: {
						click: () => {
							this.cropper.scaleY(-this.cropper.getData().scaleY || -1);
						}
					},
					inside: $('.cropper-bar', popup)
				});
			}

			// Modify the behaviour of the default editor: we don't want to upload an image
			// before it is edited

			// Do I have to unbind to change the event handler, or there is another way?
			// What about other events: copy-paste, drag & drop?
			$('input[type=file]', popup).addEventListener('change', evt => {
				const file = evt.target.files[0];
				fileName = file.name;
				fileType = file.type;
				tempURL = URL.createObjectURL(file);

				if (this.cropper) {
					this.cropper.replace(tempURL);
				}
			});
			$.bind(popup, {
				'drop': evt => {
					const file = evt.dataTransfer.files[0];

					if (file && file.type.split('/')[0] === 'image') {
						fileName = file.name;
						fileType = file.type;
						tempURL = URL.createObjectURL(file);
						if (this.cropper) {
							this.cropper.replace(tempURL);
						}
					}
				}
			});

			// Show an end user the editor
			return popup;
		},

		done: function () {
			// this.cropper.destroy();
			if (tempURL) {
				URL.revokeObjectURL(tempURL);
			}
		}

	});

	Mavo.Locale.register('en', {
		'cropper-image-preview': 'Image preview',
		'cropper-upload': 'Upload',
		'cropper-rotate-left': 'Rotate Left',
		'cropper-rotate-right': 'Rotate Right',
		'cropper-flip-horizontal': 'Flip Horizontal',
		'cropper-flip-vertical': 'Flip Vertical'
	});

})(Bliss, Bliss.$);
