const _ = require('lodash')
const chalk = require('chalk')
const tildify = require('tildify')
const highlight = require('highlight-es')

const logger = require('../logger')

const groupErrorsByType = errors => errors.reduce((acc, cur) => {
	acc[cur.type] = acc[cur.type] || []
	acc[cur.type].push(cur)
	return acc
}, {})

const moduleNotFount = errors => {
	if (!errors) return false
	let res = []
	errors = _.uniqId(errors, 'payload')
	res.push(`${chalk.red('module not found')}\n`)
	res = res.concat(errors.map(error => {
		const requestedBy = error.error.origin && error.error.origin.resource 
			? chalk.dim(` : imported at ${chalk.italic(tildify(error.error.origin.resource))}`)
			: ''
		return ` - ${chalk.yellow(error.payload)} ${requestedBy}`
	}))
	return res.join('\n')
}

const uglifyErrors = errors => {
	if (!errors) return false
	const error = _.head(errors)
	let res = []
	const { message } = error.error
	res.push(`${chalk.red('UglifyJS Error')}: unexpected ${error.kind} in file "${error.payload}", full error message:\n`)
	res.push(chalk.dim(message))
	res.push(' ')
	return res.join('\n')
}

const vueVersionMismatch  = errors => {
	if (!errors) return false
	let res
	const error = _.head(errors)
	let	message = error.error.message.replace(/This may cause things to work incorrectly[\s\S]+/, '')
	message += 'Make sure to install both packages with the same version in your project.'
	res.push(chalk.red(message))
	return res.join('\n')
}

const unknownError = errors => {
	if (!errors) return false
	let res = errors.map(error => {
		let msg = ''
		if(error.error.origin && error.error.origin.resource) {
			msg += chalk.red(`Error in ${chalk.italic(tildify(error.error.origin.resource))}`)
			msg += '\n\n'
		}
		if (error.error.message) {
			msg += error.error.message.replace(/Module build failed:\s+/, '').trim()
		} else {
			msg += error.error.trim()
		}
		return msg
	})
	return res.join('\n')
}

const babelPluginNotFound = errors => {
	if (!errors) return false
	let res = []
	const error = _.head(errors)
	res.push(`${chalk.red('missing babel plugin: ')} following babel plugin is referenced in ${chalk.italic.tildify(error.payload.location)} but not installed in the current project`)
	res.push(`- ${error.payload.name.replace(/^(babel-plugin-)?/, 'babel-plugin-')}`)
	return res.join('\n')
}

const babelPresetNotFound = errors => {
	if (!errors) return false
	let res = []
	const error = _.head(errors)
	res.push(`${chalk.red('missing babel preset:')} following babel preset is not found in ${chalk.italic(tildify(error.payload.location))}:\n`)
  	res.push(`- ${error.payload.name.replace(/^(babel-preset-)?/, 'babel-preset-')}`)
	return res.join('\n')
}

const eslintError = errors => {
	if (!errors) return false
	let res = []
	const error = _.head(errors)
	res.push(error.error.message)
	res.push( logger.tip('You may use special comments to disable some warnings.', false) )
	res.push(chalk.dim(`
	- Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.
	- Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.`))
	return res.join('\n')
}

const run = results => {
	console.log(results.filter(it => it).join('\n\n'))
	console.log()
}

module.exports = errors => {
	errors = groupErrorsByType(errors)
	run([
		moduleNotFound(errors['module-not-found']),
	    uglifyError(errors['uglify-error']),
	    vueVersionMismatch(errors['vue-version-mismatch']),
	    babelPluginNotFound(errors['babel-plugin-not-found']),
	    babelPresetNotFound(errors['babel-preset-not-found']),
	    eslintError(errors['eslint-error']),
	    unknownError(errors.unknown)
	])
}