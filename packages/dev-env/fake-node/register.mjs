// register.mjs
import { register } from 'node:module'
import { dirname, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'

// if(!process.argv[1] || !normalize(process.argv[1]).includes('node_modules')){
//     // console.log('register');
//     register('./vite-loader.mjs', (import.meta.url))
// }
register('./vite-loader.mjs', (import.meta.url))