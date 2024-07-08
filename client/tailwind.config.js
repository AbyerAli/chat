const defaultConfig = require('tailwindcss/defaultConfig')
// const formsPlugin = require('@tailwindcss/forms')

/** @type {import('tailwindcss/types').Config} */
const config = {
	content: ['index.html', 'src/**/*.tsx'],
	theme: {
		fontFamily: {
			sans: ['Inter', ...defaultConfig.theme.fontFamily.sans]
		},
		extend: {
			colors: {
				'default-text': '#333', // Replace '#333' with the color you want
			}
		}
	},
	experimental: { optimizeUniversalDefaults: true },
	plugins: [
		require('@tailwindcss/forms'),
	]
}
module.exports = config
