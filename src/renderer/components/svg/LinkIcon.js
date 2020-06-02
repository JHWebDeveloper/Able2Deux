import React from 'react'
import { bool } from 'prop-types'

const Linked = () => (
	<svg fill="#4c4c4c" width="24px" height="22px" viewBox="0 0 24 22">
		<path d="M15.73,8.722c0.862,0.026,1.769,0.471,2.455,1.351
			c0.205,0.263,0.158,0.611-0.094,0.809c-0.253,0.197-0.604,0.158-0.807-0.109c-0.854-1.13-2.505-1.222-3.49-0.193
			c-0.542,0.565-1.119,1.097-1.654,1.667c-0.625,0.665-0.801,1.459-0.497,2.317c0.309,0.874,0.955,1.383,1.877,1.504
			c0.737,0.095,1.37-0.148,1.897-0.67c0.304-0.302,0.604-0.606,0.909-0.908c0.169-0.165,0.371-0.219,0.596-0.142
			c0.226,0.076,0.354,0.242,0.384,0.478c0.021,0.166-0.026,0.32-0.145,0.44c-0.387,0.389-0.758,0.799-1.174,1.154
			c-1.318,1.128-3.243,1.075-4.522-0.1c-1.422-1.307-1.469-3.553-0.104-4.918c0.563-0.563,1.126-1.125,1.688-1.688
			C13.695,9.069,14.568,8.711,15.73,8.722z"/>
		<path d="M22.842,8.133c-0.021,0.967-0.32,1.764-0.955,2.417
			c-0.589,0.605-1.184,1.203-1.79,1.79c-1.363,1.32-3.579,1.246-4.861-0.154c-0.078-0.085-0.156-0.173-0.225-0.268
			c-0.194-0.267-0.144-0.613,0.113-0.807c0.242-0.184,0.598-0.134,0.797,0.12c0.475,0.604,1.096,0.917,1.862,0.91
			c0.594-0.006,1.117-0.222,1.542-0.641c0.582-0.573,1.169-1.143,1.731-1.735c0.625-0.659,0.803-1.447,0.511-2.305
			s-0.913-1.371-1.811-1.514c-0.749-0.119-1.401,0.109-1.945,0.636c-0.308,0.298-0.608,0.603-0.912,0.904
			c-0.255,0.253-0.598,0.271-0.832,0.043C15.822,7.29,15.82,6.94,16.08,6.686c0.435-0.426,0.846-0.89,1.33-1.252
			c2.052-1.534,5.021-0.279,5.389,2.256C22.822,7.857,22.832,8.026,22.842,8.133z"/>
		<path d="M8.476,10.428c-0.238-0.002-2.694-0.004-3.552-0.001V1.243c-0.002-0.317-0.25-0.552-0.589-0.554
			c-0.06,0-0.266-0.001-0.547-0.001c-1-0.002-3.003-0.002-3.218,0.001C0.238,0.693,0.001,0.929,0,1.246
			c-0.001,0.316,0.238,0.56,0.568,0.563c0.442,0.005,2.237,0.006,3.22,0.004v18.373c-1-0.002-3.003-0.002-3.218,0.002
			c-0.332,0.005-0.569,0.24-0.57,0.558c-0.001,0.315,0.238,0.56,0.568,0.563c0.442,0.005,2.237,0.006,3.22,0.004
			c0.242-0.001,0.449-0.002,0.558-0.003c0.334-0.003,0.582-0.253,0.578-0.568v-9.171c0.887,0.004,3.066,0.004,3.563,0
			c0.339-0.003,0.591-0.257,0.588-0.578C9.073,10.669,8.82,10.431,8.476,10.428z"/>
	</svg>
)

const Unlinked = () => (
	<svg fill="#4c4c4c" width="24px" height="22px" viewBox="0 0 24 22">
		<path d="M14.113,17.229c-2.107-0.003-3.589-1.365-3.731-3.125
			c-0.083-1.038,0.248-1.934,0.96-2.685c0.307-0.323,0.625-0.635,0.944-0.946c0.313-0.303,0.765-0.23,0.943,0.146
			c0.104,0.22,0.057,0.472-0.135,0.666c-0.292,0.295-0.585,0.589-0.88,0.881c-1.127,1.116-0.87,2.915,0.525,3.668
			c0.84,0.455,1.942,0.289,2.639-0.398c0.312-0.306,0.619-0.617,0.927-0.926c0.252-0.251,0.603-0.264,0.833-0.033
			c0.239,0.239,0.231,0.587-0.027,0.843c-0.397,0.391-0.778,0.803-1.202,1.162C15.302,16.996,14.575,17.226,14.113,17.229z"/>
		<path d="M22.844,8.138c-0.022,0.989-0.345,1.792-0.995,2.457
			c-0.308,0.315-0.622,0.625-0.937,0.936c-0.172,0.169-0.375,0.23-0.606,0.154c-0.215-0.071-0.343-0.227-0.381-0.45
			c-0.038-0.21,0.042-0.382,0.189-0.527c0.298-0.295,0.603-0.584,0.894-0.886c0.647-0.672,0.859-1.465,0.562-2.352
			s-0.943-1.405-1.866-1.533c-0.761-0.105-1.413,0.155-1.952,0.698c-0.287,0.289-0.575,0.576-0.863,0.862
			c-0.247,0.245-0.594,0.256-0.823,0.03c-0.24-0.237-0.241-0.582,0.01-0.831c0.394-0.39,0.764-0.809,1.194-1.154
			c1.024-0.819,2.182-1.005,3.401-0.524c1.21,0.476,1.912,1.396,2.129,2.678C22.827,7.862,22.833,8.032,22.844,8.138z"/>
		<path d="M11.759,8.153c0.277,0,0.553-0.002,0.83,0c0.345,0.002,0.597,0.241,0.599,0.564
			c0.003,0.321-0.249,0.575-0.588,0.578c-0.562,0.005-1.124,0.004-1.685-0.001c-0.335-0.003-0.579-0.252-0.578-0.573
			c0.001-0.323,0.242-0.562,0.58-0.567C11.198,8.149,11.479,8.153,11.759,8.153z"/>
		<path d="M19.451,15.852c0,0.276,0.002,0.553,0,0.829
			c-0.003,0.336-0.242,0.583-0.562,0.586c-0.324,0.004-0.571-0.235-0.578-0.57c-0.008-0.354-0.001-0.709-0.001-1.062
			c0-0.204-0.002-0.407,0-0.61c0.003-0.352,0.244-0.608,0.57-0.606c0.332,0.001,0.568,0.251,0.57,0.605
			C19.453,15.299,19.451,15.574,19.451,15.852z"/>
		<path d="M13.756,6.167c0-0.28-0.001-0.562,0.001-0.843
			c0.001-0.337,0.234-0.584,0.556-0.592c0.323-0.008,0.579,0.239,0.583,0.581c0.006,0.562,0.006,1.123,0,1.685
			c-0.003,0.302-0.198,0.529-0.476,0.579c-0.25,0.045-0.513-0.09-0.613-0.33c-0.035-0.081-0.047-0.175-0.049-0.264
			C13.753,6.712,13.757,6.439,13.756,6.167C13.757,6.167,13.757,6.167,13.756,6.167z"/>
		<path d="M21.459,12.711c0.276,0,0.554-0.002,0.831,0c0.325,0.003,0.573,0.239,0.581,0.553
			c0.009,0.319-0.234,0.581-0.565,0.586c-0.574,0.008-1.148,0.008-1.724,0c-0.331-0.005-0.57-0.265-0.562-0.587
			c0.008-0.315,0.256-0.55,0.583-0.552c0.143-0.001,0.285,0,0.428,0S21.316,12.711,21.459,12.711z"/>
	</svg>
)

const LinkIcon = ({ linked }) => linked ? <Linked /> : <Unlinked />

LinkIcon.propTypes = {
	linked: bool.isRequired
}

export default LinkIcon
