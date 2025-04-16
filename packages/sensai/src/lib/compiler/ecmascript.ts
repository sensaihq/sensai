// Utils
import NativeModule from 'node:module'

// Constants
import { JSExtensionE } from '@/src/lib/compiler/enums'

// @ts-ignore
const js = NativeModule._extensions[JSExtensionE.JAVASCRIPT]

/**
 * All files written in JavaScript or languages that compile to JavaScript are transpiled into a format 
 * optimized for the V8 JavaScript engine. Their extensions, however, remain unchanged in order to keep 
 * imports workings. 
 * 
 * Please note it is possible to import a commonjs file from a ES module but the opposite is not true.
 * Attempting to import an ES module into a CommonJS module would lead to an `ERR_REQUIRE_ESM` error.
 * To insure compatibility, mjs files will be treated as regular commonjs files.
 */

// @ts-ignore
NativeModule._extensions[JSExtensionE.MODULE] = js
// @ts-ignore
NativeModule._extensions[JSExtensionE.TYPESCRIPT] = js