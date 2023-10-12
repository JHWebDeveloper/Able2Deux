export * as STATUS from './status'

import { STATUS } from 'constants'

// ---- SCHEMAS --------

const DEFAULT_COLOR_CURVES = Object.freeze([
  {
    id: '',
    hidden: false,
    limit: true,
    x: 0,
    y: 256
  },
  {
    id: '',
    hidden: false,
    limit: true,
    x: 256,
    y: 0
  }
])

export const MEDIA_ATTRIBUTES = Object.freeze([
	{
		attribute: 'audioVideoTracks',
		label: 'Audio Export As',
		value: 'video_audio',
		inputType: [
			{
				label: 'Video+Audio',
				value: 'video_audio',
			},
			{
				label: 'Video Only',
				value: 'video',
			},
			{
				label: 'Audio Only',
				value: 'audio',
			}
		]
	},
	{
		attribute: 'audioExportFormat',
		label: 'Audio Format',
		value: 'wav',
    inputType: [
      {
        label: '.wav',
        value: 'wav'
      },
      {
        label: '.mp3',
        value: 'mp3'
      },
      {
        label: '.mp4 + color bars',
        value: 'bars'
      }
    ]
	},
	{
		attribute: 'arc',
		label: 'AR Correction',
		value: 'none',
		inputType: [
      {
        label: 'None',
        value: 'none'
      },
      {
        label: 'Fill Frame',
        value: 'fill'
      },
      {
        label: 'Fit in Frame',
        value: 'fit'
      },
      {
        label: 'Transform',
        value: 'transform'
      }
		]
	},
	{
		attribute: 'background',
		label: 'Background',
		value: 'blue',
    inputType: [
      {
        label: 'Blue',
        value: 'blue'
      },
      {
        label: 'Grey',
        value: 'grey'
      },
      {
        label: '11pm Blue 1',
        value: 'light_blue'
      },
      {
        label: '11pm Blue 2',
        value: 'dark_blue'
      },
      {
        label: '11pm Teal',
        value: 'teal'
      },
      {
        label: '11pm Tan',
        value: 'tan'
      },
      {
        label: 'Transparent',
        value: 'alpha'
      },
      {
        label: 'Color',
        value: 'color'
      }
    ]
	},
	{
		attribute: 'bgColor',
		label: 'Background Color',
		value: '#000000',
    inputType: 'color'
	},
	{
		attribute: 'backgroundMotion',
		label: 'Background Motion',
		value: 'animated',
    inputType: [
      {
        label: 'Animated',
        value: 'animated'
      },
      {
        label: 'Still',
        value: 'still'
      }
    ]
	},
	{
		attribute: 'overlay',
		label: 'Overlay',
		value: 'none',
    inputType: [
      {
        label: 'None',
        value: 'none'
      },
      {
        label: 'TV',
        value: 'tv'
      },
      {
        label: 'Laptop',
        value: 'laptop'
      }
    ]
	},
	{
		attribute: 'sourceName',
		label: 'Source',
		value: '',
		inputType: 'text',
		constraints: {
			maxLength: 51
		}
	},
	{
		attribute: 'sourcePrefix',
		label: 'Add "Source: " to beginning',
		value: true,
		inputType: 'boolean'
	},
	{
		attribute: 'sourceOnTop',
		label: 'Place source at top of video',
		value: false,
		inputType: 'boolean'
	},
	{
		attribute: 'centering',
		label: 'Centering',
		value: 0,
		inputType: 'number',
		constraints: {
			min: -100,
			max: 100
		}
	},
	{
		attribute: 'positionX',
		label: 'Position X',
		value: 0,
		inputType: 'number',
		constraints: {
			min: -100,
			max: 100
		}
	},
	{
		attribute: 'positionY',
		label: 'Position Y',
		value: 0,
		inputType: 'number',
		constraints: {
			min: -100,
			max: 100
		}
	},
	{
		attribute: 'scaleX',
		label: 'Scale X',
		value: 100,
		inputType: 'number',
		constraints: {
			min: -0,
			max: 4500
		}
	},
	{
		attribute: 'scaleY',
		label: 'Scale Y',
		value: 100,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 4500
		}
	},
	{
		attribute: 'scaleLink',
		label: 'Link Scale X & Y',
		value: true,
		inputType: 'boolean'
	},
	{
		attribute: 'cropT',
		label: 'Crop Top',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'cropB',
		label: 'Crop Bottom',
		value: 100,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'cropL',
		label: 'Crop Left',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'cropR',
		label: 'Crop Right',
		value: 100,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'cropLinkTB',
		label: 'Link Crop Top & Bottom',
		value: true,
		inputType: 'boolean'
	},
	{
		attribute: 'cropLinkLR',
		label: 'Link Crop Left & Right',
		value: true,
		inputType: 'boolean'
	},
	{
		attribute: 'reflect',
		label: 'Reflect',
		value: '',
    inputType: [
      {
        label: 'None',
        value: ''
      },
      {
        label: 'Horizontally',
        value: 'hflip'
      },
      {
        label: 'Vertically',
        value: 'vflip'
      },
      {
        label: 'Both',
        value: 'hflip,vflip'
      }
    ]
	},
	{
		attribute: 'transpose',
		label: 'Rotate',
		value: '',
    inputType: [
      {
        label: '0°',
        value: ''
      },
      {
        label: '90°cw',
        value: 'transpose=1'
      },
      {
        label: '90°ccw',
        value: 'transpose=2'
      },
      {
        label: '180°',
        value: 'transpose=2,transpose=2'
      }
    ]
	},
	{
		attribute: 'freeRotateMode',
		label: 'Free Rotate Mode',
		value: 'inside_bounds',
    inputType: [
      {
        label: 'Inside Bounds',
        value: 'inside_bounds'
      },
      {
        label: 'With Bounds',
        value: 'with_bounds'
      }
    ]
	},
	{
		attribute: 'angle',
		label: 'Free Rotate Angle',
		value: 0,
		inputType: 'number',
		constraints: {
			min: -180,
			max: 180
		}
	},
	{
		attribute: 'rotatedCentering',
		label: 'Free Rotate Centering',
		value: 0,
		inputType: 'number',
		constraints: {
			min: -100,
			max: 100
		}
	},
	{
		attribute: 'keyingEnabled',
		label: 'Keying On/Off',
		value: false,
		inputType: 'boolean'
	},
	{
		attribute: 'keyingType',
		label: 'Key Type',
		value: 'colorkey',
    inputType: [
      {
        label: 'Color Key',
        value: 'colorkey'
      },
      {
        label: 'Chroma Key',
        value: 'chromakey'
      },
      {
        label: 'Luma Key',
        value: 'lumakey'
      }
    ]
	},
	{
		attribute: 'keyingColor',
		label: 'Key Color',
		value: '#04f404',
		inputType: 'color'
	},
	{
		attribute: 'keyingSimilarity',
		label: 'Similarity',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 1,
			max: 100
		}
	},
	{
		attribute: 'keyingBlend',
		label: 'Blend',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'keyingThreshold',
		label: 'Threshold',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'keyingTolerance',
		label: 'Tolerance',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'keyingSoftness',
		label: 'Softness',
		value: 0,
		inputType: 'number',
		constraints: {
			min: 0,
			max: 100
		}
	},
	{
		attribute: 'ccEnabled',
		label: 'Color Correction On/Off',
		value: false,
		inputType: 'boolean'
	},
	{
		attribute: 'ccRGB',
		label: 'RGB',
		value: [...DEFAULT_COLOR_CURVES],
		inputType: 'curve'
	},
	{
		attribute: 'ccR',
		label: 'R',
		value: [...DEFAULT_COLOR_CURVES],
		inputType: 'curve'
	},
	{
		attribute: 'ccG',
		label: 'G',
		value: [...DEFAULT_COLOR_CURVES],
		inputType: 'curve'
	},
	{
		attribute: 'ccB',
		label: 'B',
		value: [...DEFAULT_COLOR_CURVES],
		inputType: 'curve'
	}
].map((attr, i) => ({
	...attr,
	include: false,
	order: i
})))

export const DEFAULT_MEDIA_STATE = Object.freeze({
  id: '',
  refId: '',
  focused: false,
  anchored: false,
  selected: false,
  acquisitionType: '',
  mediaType: 'video',
  hasAlpha: false,
  hasAudio: true,
  url: '',
  isLive: false,
  sourceFilePath: '',
  tempFilePath: '',
  thumbnail: '',
  timecode: 0,
  exportFilename: '',
  status: STATUS.PENDING,
  downloadETA: 0,
  downloadPercent: 0,
  renderStatus: STATUS.PENDING,
  renderPercent: 0,
  title: '',
  duration: 0,
  totalFrames: 0,
  width: 0,
  height: 0,
  aspectRatio: '',
  originalWidth: 0,
  originalHeight: 0,
  originalAspectRatio: '',
  fps: 1,
  channelLayout: '',
  sampleRate: '',
  bitRate: '',
  filename: '',
  start: 0,
  end: 0,
  keyingHidden: false,
  ccHidden: false,
  ccSelectedCurve: 'ccRGB',
  presetNamePrepend: '',
	presetNameAppend: '',
  ...MEDIA_ATTRIBUTES.reduce((acc, { attribute, value }) => {
    acc[attribute] = value
    return acc
  }, {})
})

const COMMON_PRESET_STATE = {
	id: '',
	label: '',
	hidden: false,
	limitTo: ['audio', 'gif', 'image', 'video'],
}

export const DEFAULT_PRESET_STATE = {
	...COMMON_PRESET_STATE,
	type: 'preset'
}

export const DEFAULT_BATCH_PRESET_STATE = {
	...COMMON_PRESET_STATE,
	type: 'batchPreset',
	limitToOverwrite: false,
	presetNamePrependMergeType: 'replace',
	presetNameAppendMergeType: 'replace',
	presetIds: []
}

// ---- RECORDS --------

export const RADIO_SET = Object.freeze({
	...MEDIA_ATTRIBUTES.reduce((acc, { attribute, inputType }) => {
		if (Array.isArray(inputType)) acc[attribute] = [...inputType]
		return acc
	}, {}),
	optimize: [
		{
			label: 'Optimize Video Quality',
			value: 'quality'
		},
		{
			label: 'Optimize Download Time',
			value: 'download'
		}
	]
})

export const TOASTR_OPTIONS = Object.freeze({
	closeButton: true,
	positionClass: 'toast-bottom-right',
	hideDuration: 150,
	timeOut: 0,
	extendedTimeOut: 0
})

// ---- TUPLES --------

export const MEDIA_TYPES = Object.freeze(['audio', 'gif', 'image', 'video'])

// ---- NUMBERS --------

export const RATIO_9_16 = 0.5625

export const TAU = Math.PI * 2
